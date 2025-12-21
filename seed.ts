const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Please define MONGODB_URI in .env.local");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); // Uses the database name from your connection string
    const usersCollection = db.collection('users');

    // Check if an admin already exists
    const adminExists = await usersCollection.findOne({ role: 'ADMIN' });

    if (adminExists) {
      console.log('Admin already exists. Skipping seed.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isFirstLogin: false,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedAdmin();