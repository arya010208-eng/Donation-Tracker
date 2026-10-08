import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import CampaignsPage from './pages/CampaignsPage';
import DonationsPage from './pages/DonationsPage';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [activePage, setActivePage] = useState('campaigns'); // 'campaigns' | 'donations' | 'auth'
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('donation_tracker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [campaigns, setCampaigns] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  // Fetch campaigns and summary data
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        setRecentDonations(data.recentDonations || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('donation_tracker_user', JSON.stringify(loggedInUser));
    setActivePage('campaigns');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('donation_tracker_user');
  };

  const handleSelectCampaignForDonation = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setActivePage('donations');
  };

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activePage === 'campaigns' && (
          <CampaignsPage
            campaigns={campaigns}
            stats={stats}
            loading={loading}
            onSelectCampaign={handleSelectCampaignForDonation}
            onRefresh={fetchData}
          />
        )}

        {activePage === 'donations' && (
          <DonationsPage
            campaigns={campaigns}
            recentDonations={recentDonations}
            selectedCampaignId={selectedCampaignId}
            user={user}
            onDonationSuccess={fetchData}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <footer className="footer">
        Donation Tracker &bull; 45-Minute Workshop Edition &bull; Verified with MiniMoth WhatsApp/SMS OTP
      </footer>
    </div>
  );
}

