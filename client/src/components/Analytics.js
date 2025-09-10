import React, { useState, useEffect } from 'react';
import { taskAPI } from '../utils/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAnalytics();
      setAnalytics(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!analytics) return <div className="analytics-error">No analytics data available</div>;

  const getCompletionPercentage = () => {
    return analytics.totalTasks > 0 
      ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
      : 0;
  };

  const renderProgressBar = (percentage) => (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="progress-text">{percentage}%</span>
    </div>
  );

  const renderPriorityChart = () => {
    const maxCount = Math.max(...analytics.priorityStats.map(p => p.count), 1);
    
    return (
      <div className="chart-container">
        {analytics.priorityStats.map(stat => (
          <div key={stat._id} className="chart-bar">
            <div className="bar-label">{stat._id}</div>
            <div className="bar-container">
              <div 
                className={`bar bar-${stat._id}`}
                style={{ 
                  height: `${(stat.count / maxCount) * 100}%`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="bar-count">{stat.count}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryChart = () => {
    if (!analytics.categoryStats || analytics.categoryStats.length === 0) {
      return <div className="no-data">No category data available</div>;
    }

    const maxCount = Math.max(...analytics.categoryStats.map(c => c.count), 1);
    
    return (
      <div className="chart-container category-chart">
        {analytics.categoryStats.map(stat => (
          <div key={stat._id} className="chart-bar">
            <div className="bar-label">{stat._id}</div>
            <div className="bar-container">
              <div 
                className="bar bar-category"
                style={{ 
                  height: `${(stat.count / maxCount) * 100}%`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="bar-count">{stat.count}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Task Analytics Dashboard</h2>
        <button onClick={fetchAnalytics} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-number">{analytics.totalTasks}</p>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{analytics.completedTasks}</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{analytics.pendingTasks}</p>
          </div>
        </div>
        
        <div className="stat-card completion-rate">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <p className="stat-number">{getCompletionPercentage()}%</p>
          </div>
        </div>

        {analytics.recentCompletions !== undefined && (
          <div className="stat-card recent">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>This Week</h3>
              <p className="stat-number">{analytics.recentCompletions}</p>
            </div>
          </div>
        )}
      </div>

      <div className="progress-section">
        <h3>Overall Progress</h3>
        {renderProgressBar(getCompletionPercentage())}
      </div>

      <div className="charts-container">
        <div className="chart-section">
          <h3>Priority Distribution</h3>
          {analytics.priorityStats.length > 0 ? renderPriorityChart() : (
            <div className="no-data">No priority data available</div>
          )}
        </div>

        <div className="chart-section">
          <h3>Category Distribution</h3>
          {renderCategoryChart()}
        </div>
      </div>

      <div className="insights-section">
        <h3>📝 Insights</h3>
        <div className="insights">
          {analytics.totalTasks === 0 && (
            <p className="insight">🎯 Start by adding your first task!</p>
          )}
          {analytics.completedTasks > 0 && analytics.pendingTasks === 0 && (
            <p className="insight">🎉 Congratulations! All tasks completed!</p>
          )}
          {analytics.pendingTasks > analytics.completedTasks && (
            <p className="insight">💪 You have more pending tasks than completed. Keep going!</p>
          )}
          {getCompletionPercentage() >= 75 && analytics.totalTasks > 0 && (
            <p className="insight">🌟 Great progress! You're doing excellent!</p>
          )}
          {analytics.recentCompletions > 0 && (
            <p className="insight">🔥 You've completed {analytics.recentCompletions} tasks this week!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
