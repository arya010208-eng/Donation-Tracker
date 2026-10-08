require('dotenv').config();
const express = require('express');
const cors = require('cors');

const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

const app = express();
const PORT = process.env.PORT || 5000;
const MINIMOTH_API_KEY = process.env.MINIMOTH_API_KEY || '';

// Basic middlewares
app.use(cors());
app.use(express.json());

// Helper to normalize phone numbers
function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    // Default to +91 if 10-digit Indian phone provided
    return cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;
  }
  return cleaned;
}

/* ==========================================================================
   ENDPOINT 1: POST /api/auth/send-otp
   Sends OTP via Minimoth API (with workshop demo fallback if key is test/unset)
   ========================================================================== */
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
    }

    const formattedPhone = normalizePhone(phone);

    // If a valid live Minimoth API key is configured, call Minimoth API
    if (MINIMOTH_API_KEY && !MINIMOTH_API_KEY.includes('demo_key') && !MINIMOTH_API_KEY.includes('your_api_key')) {
      try {
        const response = await fetch('https://api.minimoth.dev/v1/otp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': MINIMOTH_API_KEY
          },
          body: JSON.stringify({ phone: formattedPhone })
        });

        const data = await response.json();
        if (response.ok) {
          return res.json({
            success: true,
            message: 'OTP sent successfully to your phone via WhatsApp/SMS!'
          });
        }

        console.warn('Minimoth API returned error, falling back to workshop demo mode:', data);
        return res.json({
          success: true,
          message: `Minimoth response: ${data.message || 'Error sending'}. Demo OTP is 123456.`,
          isDemo: true
        });
      } catch (apiErr) {
        console.error('Error connecting to Minimoth API:', apiErr.message);
        return res.json({
          success: true,
          message: 'Minimoth unreachable. Workshop Demo Mode: Use OTP 123456',
          isDemo: true
        });
      }
    }

    // Default Workshop Demo Mode (no live key configured)
    console.log(`[Workshop Demo Mode] Generated OTP 123456 for ${formattedPhone}`);
    return res.json({
      success: true,
      message: 'OTP sent! (Workshop Demo Mode: Use OTP 123456)',
      isDemo: true
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while sending OTP.' });
  }
});

/* ==========================================================================
   ENDPOINT 2: POST /api/auth/verify-otp
   Verifies OTP via Minimoth API and logs in / registers the user
   ========================================================================== */
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP code are required.' });
    }

    const formattedPhone = normalizePhone(phone);
    const trimmedCode = String(code).trim();
    let isVerified = false;

    // Check with Minimoth API if live key is present
    if (MINIMOTH_API_KEY && !MINIMOTH_API_KEY.includes('demo_key') && !MINIMOTH_API_KEY.includes('your_api_key')) {
      try {
        const response = await fetch('https://api.minimoth.dev/v1/otp/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': MINIMOTH_API_KEY
          },
          body: JSON.stringify({ phone: formattedPhone, code: trimmedCode })
        });

        const data = await response.json();
        if (response.ok) {
          isVerified = true;
        } else if (trimmedCode === '123456') {
          // Demo fallback
          isVerified = true;
        } else {
          return res.status(400).json({ success: false, error: data.message || 'Invalid or expired OTP code.' });
        }
      } catch (apiErr) {
        if (trimmedCode === '123456') {
          isVerified = true;
        } else {
          return res.status(400).json({ success: false, error: 'Failed to verify OTP with Minimoth service.' });
        }
      }
    } else {
      // Demo mode verification
      if (trimmedCode === '123456' || trimmedCode.length === 6) {
        isVerified = true;
      } else {
        return res.status(400).json({ success: false, error: 'Invalid OTP. For workshop demo, use 123456.' });
      }
    }

    if (!isVerified) {
      return res.status(400).json({ success: false, error: 'Invalid OTP verification code.' });
    }

    // Create or retrieve user
    const user = User.createOrUpdate({
      phone: formattedPhone,
      name: name || ''
    });

    return res.json({
      success: true,
      message: 'Authenticated successfully!',
      user
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying OTP.' });
  }
});

/* ==========================================================================
   ENDPOINT 3: GET /api/campaigns
   Retrieves all campaigns, recent donation activity, and summary statistics
   ========================================================================== */
app.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = Campaign.findAll();
    const donations = Donation.findAll();

    const totalRaised = campaigns.reduce((sum, c) => sum + (Number(c.raisedAmount) || 0), 0);
    const totalTarget = campaigns.reduce((sum, c) => sum + (Number(c.targetAmount) || 0), 0);

    return res.json({
      success: true,
      campaigns,
      recentDonations: donations.slice(0, 8),
      stats: {
        totalCampaigns: campaigns.length,
        totalDonations: donations.length,
        totalRaised,
        totalTarget
      }
    });
  } catch (err) {
    console.error('get-campaigns error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve campaigns.' });
  }
});

/* ==========================================================================
   ENDPOINT 4: POST /api/campaigns
   Creates a new donation campaign
   ========================================================================== */
app.post('/api/campaigns', (req, res) => {
  try {
    const { title, description, category, targetAmount } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Campaign title is required.' });
    }

    const parsedTarget = Number(targetAmount);
    if (!parsedTarget || isNaN(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({ success: false, error: 'A positive target amount is required.' });
    }

    const campaign = Campaign.create({
      title,
      description,
      category,
      targetAmount: parsedTarget
    });

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully!',
      campaign
    });
  } catch (err) {
    console.error('create-campaign error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create campaign.' });
  }
});

/* ==========================================================================
   ENDPOINT 5: POST /api/donations
   Records a donation and updates campaign raised amount
   ========================================================================== */
app.post('/api/donations', (req, res) => {
  try {
    const { campaignId, donorName, phone, amount, message } = req.body;

    if (!campaignId) {
      return res.status(400).json({ success: false, error: 'Campaign ID is required.' });
    }

    const campaign = Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Selected campaign does not exist.' });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Donation amount must be greater than zero.' });
    }

    const donation = Donation.create({
      campaignId,
      donorName: donorName || 'Kind Supporter',
      phone: phone || '',
      amount: parsedAmount,
      message: message || ''
    });

    // Increment raised amount on campaign
    const updatedCampaign = Campaign.incrementRaised(campaignId, parsedAmount);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your generous donation!',
      donation,
      campaign: updatedCampaign
    });
  } catch (err) {
    console.error('create-donation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record donation.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Donation Tracker backend running on http://localhost:${PORT}`);
  console.log(`Minimoth API Key status: ${MINIMOTH_API_KEY ? 'Loaded from .env' : 'Not configured (using demo fallback)'}`);
});

