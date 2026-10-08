import 'dotenv/config';
import mongoose from 'mongoose';
import Joi from 'joi';
import {pathToFileURL} from 'node:url';
import connectDB from './connection.js';
import User from './models/User.js';
import {hash} from '../utils/hashing/hashing.js';

// Public demo credentials, exclusively for a local development database.
export const LOCAL_ADMIN = Object.freeze({
  email: 'admin@example.com',
  password: 'AldiwanyaLocal!2026',
  phoneNumber: '+96550000009',
});

export function getAdminSeedConfig(env = process.env) {
  const local = ['development', 'test'].includes(env.NODE_ENV)
    && /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?\//.test(env.DB_URI || '');
  if (!local && (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_PHONE)) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_PHONE for non-local databases.');
  }
  const values = {
    email: env.ADMIN_EMAIL || LOCAL_ADMIN.email,
    password: env.ADMIN_PASSWORD || LOCAL_ADMIN.password,
    phoneNumber: env.ADMIN_PHONE || LOCAL_ADMIN.phoneNumber,
  };
  if (!local && values.password === LOCAL_ADMIN.password) {
    throw new Error('The public demo password cannot be used outside local development.');
  }
  const result = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(12).max(72).pattern(/\S/).required(),
    phoneNumber: Joi.string().pattern(/^\+965[569]\d{7}$/).required(),
  }).validate(values);
  if (result.error || Buffer.byteLength(values.password) > 72) {
    throw new Error('Invalid admin seed values: use a valid email, Kuwait phone and a password of 12 characters to 72 UTF-8 bytes.');
  }
  return result.value;
}

export async function seedAdmin(env = process.env) {
  const {email, password, phoneNumber} = getAdminSeedConfig(env);
  const existing = await User.findOne({$or: [{email}, {phoneNumber}]});
  if (existing) {
    if (existing.role !== 'Admin' || existing.email !== email || existing.phoneNumber !== phoneNumber) {
      throw new Error('Seed email or phone belongs to another account. No account was changed.');
    }
    return {created: false, email};
  }
  await User.create({fullName: 'Super Admin', email, phoneNumber,
    passwordHash: hash({plainText: password}), role: 'Admin', termsAccepted: true, termsVersion: 'v1'});
  return {created: true, email};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    getAdminSeedConfig(); // Fail before opening a connection if credentials are unsafe.
    await connectDB();
    const result = await seedAdmin();
    console.log(result.created ? 'Admin created: ' + result.email : 'Admin already exists; password unchanged.');
  } catch (error) {
    console.error(error.code ? 'Admin seed failed; check database constraints. Code: ' + error.code : error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
