import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function DonationsPage({
  campaigns,
  recentDonations,
  selectedCampaignId,
  user,
  onDonationSuccess
}) {
  const [campaignId, setCampaignId] = useState(selectedCampaignId || '');
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [amount, setAmount] = useState('500');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Update pre-selected campaign or user if changed
  useEffect(() => {
    if (selectedCampaignId) {
      setCampaignId(selectedCampaignId);
    } else if (campaigns.length > 0 && !campaignId) {
      setCampaignId(campaigns[0].id);
    }
  }, [selectedCampaignId, campaigns]);

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name);
      if (!phone) setPhone(user.phone);
    }
  }, [user]);

  const presetAmounts = ['250', '500', '1000', '2500', '5000'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    if (!campaignId) {
      setFeedback({ type: 'error', text: 'Please select a campaign to support.' });
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a donation amount greater than 0.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          donorName: donorName.trim() || 'Anonymous Supporter',
          phone: phone.trim(),
          amount: numAmount,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit donation.');
      }

      setFeedback({
        type: 'success',
        text: `Thank you, ${donorName || 'Supporter'}! Your contribution of ₹${numAmount} was recorded successfully!`
      });

      // Clear non-persistent fields
      setMessage('');
      if (onDonationSuccess) {
        onDonationSuccess();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getCampaignTitle = (id) => {
    const c = campaigns.find(item => item.id === id);
    return c ? c.title : 'Direct Support';
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
      <div className="page-header">
        <h1 className="page-title">Make a Contribution</h1>
        <p className="page-subtitle">Every rupee creates a meaningful ripple in someone's life.</p>
      </div>

      <div className="donation-layout">
        {/* Donation Form Card */}
        <div className="form-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#111827' }}>
            Donation Details
          </h2>

          {feedback.text && (
            <div className={`alert alert-${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-camp">Select Cause *</label>
              <select
                id="select-camp"
                className="form-select"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                required
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donor-name">Donor Name</label>
              <input
                id="donor-name"
                className="form-input"
                type="text"
                placeholder="e.g. Maya Verma (or leave blank for Anonymous)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contribution Amount (₹) *</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="chip-grid">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`chip-btn ${amount === preset ? 'active' : ''}`}
                    onClick={() => setAmount(preset)}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="donor-msg">Warm Message or Dedication (Optional)</label>
              <textarea
                id="donor-msg"
                className="form-textarea"
                rows={2}
                placeholder="Write a message of hope or encouragement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Recording Donation...' : `Give ${formatCurrency(amount)}`}
            </button>
          </form>
        </div>

        {/* Live Activity Feed */}
        <div className="activity-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#111827' }}>
            Recent Contributions
          </h2>

          {recentDonations && recentDonations.length > 0 ? (
            <div>
              {recentDonations.map((d) => (
                <div key={d.id} className="activity-item">
                  <div style={{ maxWidth: '68%' }}>
                    <div className="activity-donor">{d.donorName || 'Kind Supporter'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0.1rem 0' }}>
                      to <strong>{getCampaignTitle(d.campaignId)}</strong>
                    </div>
                    {d.message && <div className="activity-note">"{d.message}"</div>}
                  </div>
                  <div>
                    <div className="activity-amount">{formatCurrency(d.amount)}</div>
                    <div className="activity-date">
                      {new Date(d.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No donations yet. Be the first to contribute!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

