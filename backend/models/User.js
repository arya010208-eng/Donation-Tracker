const { readDB, writeDB } = require('../db');

class User {
  static findAll() {
    const db = readDB();
    return db.users;
  }

  static findById(id) {
    const db = readDB();
    return db.users.find(u => u.id === id) || null;
  }

  static findByPhone(phone) {
    const db = readDB();
    return db.users.find(u => u.phone === phone) || null;
  }

  static createOrUpdate({ phone, name }) {
    const db = readDB();
    const existingIndex = db.users.findIndex(u => u.phone === phone);

    if (existingIndex >= 0) {
      if (name && name.trim()) {
        db.users[existingIndex].name = name.trim();
        writeDB(db);
      }
      return db.users[existingIndex];
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      phone: phone.trim(),
      name: (name && name.trim()) ? name.trim() : 'Kind Supporter',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);
    return newUser;
  }
}

module.exports = User;

