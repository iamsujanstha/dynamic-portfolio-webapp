import 'dotenv/config';
import mongoose from 'mongoose';
import VerificationCode from '../src/models/VerificationCode';
import User from '../src/models/User';

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  
  console.log('--- Verification Codes ---');
  const codes = await VerificationCode.find({}).lean();
  console.log(codes);

  console.log('--- Users ---');
  const users = await User.find({}).lean();
  console.log(users);

  process.exit(0);
}
check().catch(console.error);
