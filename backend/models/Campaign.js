const { readDB, writeDB } = require('../db');

class Campaign {
  static findAll() {
    const db = readDB();
    return db.campaigns;
  }

  static findById(id) {
    const db = readDB();
    return db.campaigns.find(c => c.id === id) || null;
  }

  static create({ title, description, category, targetAmount }) {
    const db = readDB();
    const newCampaign = {
      id: `camp_${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General Support',
      targetAmount: Number(targetAmount),
      raisedAmount: 0,
      createdAt: new Date().toISOString()
    };

    db.campaigns.unshift(newCampaign);
    writeDB(db);
    return newCampaign;
  }

  static incrementRaised(id, amount) {
    const db = readDB();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return null;

    campaign.raisedAmount = (Number(campaign.raisedAmount) || 0) + Number(amount);
    writeDB(db);
    return campaign;
  }
}

module.exports = Campaign;

