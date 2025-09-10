const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Task = require('../models/Task');

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;

describe('Task API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  beforeEach(async () => {
    // Clean database before each test
    await Task.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  // TEST CASE 1: Create Task (POST)
  describe('POST /api/tasks', () => {
    test('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description for automated testing',
        priority: 'high',
        category: 'work'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.category).toBe(taskData.category);
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Verify task was saved to database
      const savedTask = await Task.findById(response.body._id);
      expect(savedTask).toBeTruthy();
      expect(savedTask.title).toBe(taskData.title);
    });

    test('should fail to create task without required title', async () => {
      const invalidTaskData = {
        description: 'Task without title',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTaskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    test('should create task with default values', async () => {
      const minimalTaskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(minimalTaskData)
        .expect(201);

      expect(response.body.priority).toBe('medium'); // default
      expect(response.body.category).toBe('general'); // default
      expect(response.body.completed).toBe(false); // default
    });
  });

  // TEST CASE 2: Delete Task (DELETE)
  describe('DELETE /api/tasks/:id', () => {
    test('should delete an existing task successfully', async () => {
      // First create a task
      const task = new Task({
        title: 'Task to Delete',
        description: 'This task will be deleted in test',
        priority: 'low'
      });
      await task.save();

      // Delete the task
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task was removed from database
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    test('should return 404 when deleting non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task not found');
    });

    test('should return 500 for invalid ObjectId format', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ADDITIONAL TEST: Read Tasks (GET)
  describe('GET /api/tasks', () => {
    test('should get all tasks', async () => {
      // Create test tasks
      const task1 = new Task({ title: 'Task 1', priority: 'high' });
      const task2 = new Task({ title: 'Task 2', priority: 'low' });
      await task1.save();
      await task2.save();

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 2'); // Should be sorted by createdAt desc
      expect(response.body[1].title).toBe('Task 1');
    });

    test('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  // ADDITIONAL TEST: Update Task (PATCH)
  describe('PATCH /api/tasks/:id', () => {
    test('should update task completion status', async () => {
      const task = new Task({
        title: 'Task to Complete',
        completed: false
      });
      await task.save();

      const response = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
      expect(response.body.completedAt).toBeTruthy();

      // Verify in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.completedAt).toBeTruthy();
    });
  });

  // ANALYTICS TEST
  describe('GET /api/tasks/analytics', () => {
    test('should return analytics data', async () => {
      // Create test data
      await Task.create([
        { title: 'Task 1', completed: true, priority: 'high', category: 'work' },
        { title: 'Task 2', completed: false, priority: 'low', category: 'personal' },
        { title: 'Task 3', completed: true, priority: 'medium', category: 'work' }
      ]);

      const response = await request(app)
        .get('/api/tasks/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('totalTasks', 3);
      expect(response.body).toHaveProperty('completedTasks', 2);
      expect(response.body).toHaveProperty('pendingTasks', 1);
      expect(response.body).toHaveProperty('completionRate', '66.7');
      expect(response.body).toHaveProperty('priorityStats');
      expect(response.body).toHaveProperty('categoryStats');
      expect(Array.isArray(response.body.priorityStats)).toBe(true);
      expect(Array.isArray(response.body.categoryStats)).toBe(true);
    });
  });
});
