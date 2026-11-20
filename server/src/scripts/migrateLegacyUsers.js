import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env'), override: true });
dotenv.config({ override: true });

async function migrateLegacyUsers() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in server/.env');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find legacy users where isEmailVerified is null or not set
    const filter = {
      $or: [
        { isEmailVerified: { $exists: false } },
        { isEmailVerified: null },
      ],
    };

    const count = await User.countDocuments(filter);
    console.log(`Found ${count} legacy user(s) needing email verification status update.`);

    if (count > 0) {
      const result = await User.updateMany(filter, {
        $set: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      console.log(`✅ Successfully migrated ${result.modifiedCount} legacy user(s) to isEmailVerified: true.`);
    } else {
      console.log('No legacy users required migration.');
    }

    await mongoose.disconnect();
    console.log('Migration completed safely.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrateLegacyUsers();
