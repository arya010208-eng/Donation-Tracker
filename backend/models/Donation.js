const { readDB, writeDB } = require('../db');

class Donation {
  static findAll() {
    const db = readDB();
    // Return newest donations first
    return [...db.donations].reverse();
  }

  static findByCampaign(campaignId) {
    const db = readDB();
    return db.donations
      .filter(d => d.campaignId === campaignId)
      .reverse();
  }

  static create({ campaignId, donorName, phone, amount, message }) {
    const db = readDB();
    const newDonation = {
      id: `don_${Date.now()}`,
      campaignId,
      donorName: (donorName && donorName.trim()) ? donorName.trim() : 'Anonymous Donor',
      phone: phone ? phone.trim() : '',
      amount: Number(amount),
      message: message ? message.trim() : '',
      createdAt: new Date().toISOString()
    };

    db.donations.push(newDonation);
    writeDB(db);
    return newDonation;
  }
}

module.exports = Donation;

