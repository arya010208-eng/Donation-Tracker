import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function CampaignsPage({ campaigns, stats, loading, onSelectCampaign, onRefresh }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Education');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Campaign title is required.');
      return;
    }

    const target = Number(targetAmount);
    if (!target || target <= 0) {
      setError('Please provide a valid target amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          targetAmount: target,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create campaign.');
      }

      setSuccess('Campaign launched successfully!');
      setTitle('');
      setTargetAmount('');
      setDescription('');
      setShowCreateForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div>
      {/* Header & Action */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Active Donation Causes</h1>
          <p className="page-subtitle">Support vetted grassroots initiatives making a real community impact.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Close Form' : '+ Start a Campaign'}
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Raised</div>
            <div className="stat-value">{formatCurrency(stats.totalRaised)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Backers</div>
            <div className="stat-value">{stats.totalDonations}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Causes</div>
            <div className="stat-value">{stats.totalCampaigns}</div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal / Form */}
      {showCreateForm && (
        <div className="form-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
            Launch a New Cause
          </h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleCreateCampaign}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="camp-title">Campaign Title *</label>
                <input
                  id="camp-title"
                  className="form-input"
                  placeholder="e.g. Winter Blankets for Homeless"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="camp-cat">Category *</label>
                <select
                  id="camp-cat"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Sanitation">Sanitation & Water</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Animal Welfare">Animal Welfare</option>
                  <option value="Community">Community Support</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="camp-target">Target Goal (₹) *</label>
                <input
                  id="camp-target"
                  className="form-input"
                  type="number"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="camp-desc">Description & Purpose</label>
              <textarea
                id="camp-desc"
                className="form-textarea"
                rows={3}
                placeholder="Briefly explain the mission and how the funds will be utilized..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading active campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          No campaigns found. Click "+ Start a Campaign" to create the first one!
        </div>
      ) : (
        <div className="campaigns-grid">
          {campaigns.map((camp) => {
            const raised = Number(camp.raisedAmount) || 0;
            const target = Number(camp.targetAmount) || 1;
            const pct = Math.min(Math.round((raised / target) * 100), 100);

            return (
              <div key={camp.id} className="campaign-card">
                <div>
                  <span className="campaign-category">{camp.category || 'General'}</span>
                  <h3 className="campaign-title">{camp.title}</h3>
                  <p className="campaign-desc">{camp.description || 'No description provided.'}</p>
                </div>

                <div>
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>{formatCurrency(raised)}</span>
                      <span style={{ color: '#6b7280' }}>{pct}% of {formatCurrency(target)}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => onSelectCampaign(camp.id)}
                  >
                    💖 Donate Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

