const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'db.json');

const initialData = {
  users: [],
  campaigns: [
    {
      id: "c-1",
      title: "Clean Water Wells for Rural Communities",
      description: "Installing solar-powered clean drinking water filtration systems in drought-affected villages.",
      category: "Sanitation",
      targetAmount: 50000,
      raisedAmount: 32500,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "c-2",
      title: "School Kits & STEM Supplies for Children",
      description: "Equipping underprivileged elementary students with textbooks, notebooks, backpacks, and science kits.",
      category: "Education",
      targetAmount: 75000,
      raisedAmount: 48000,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "c-3",
      title: "Mobile Emergency Clinic & First Aid",
      description: "Supporting community first responders with emergency medical supplies, oxygen, and clinic vans.",
      category: "Healthcare",
      targetAmount: 120000,
      raisedAmount: 64000,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ],
  donations: [
    {
      id: "d-1",
      campaignId: "c-1",
      donorName: "Aarav Patel",
      phone: "+919876543210",
      amount: 2500,
      message: "Every village deserves safe drinking water!",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: "d-2",
      campaignId: "c-2",
      donorName: "Priya Sharma",
      phone: "+919812345678",
      amount: 1500,
      message: "Keep empowering young minds.",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ]
};

function initDB() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, re-initializing...', err);
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDB(data) {
  initDB();
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readDB,
  writeDB
};

