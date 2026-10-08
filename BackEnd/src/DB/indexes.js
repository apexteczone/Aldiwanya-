import 'dotenv/config';
import mongoose from 'mongoose';
import {readdir} from 'node:fs/promises';

// Creates missing schema indexes only. Never drops or replaces existing indexes.
try {
  if (!process.env.DB_URI) throw new Error('DB_URI required');
  await mongoose.connect(process.env.DB_URI, {autoIndex: false});
  const models = new URL('./models/', import.meta.url);
  for (const file of await readdir(models)) {
    if (file.endsWith('.js')) await import(new URL(file, models));
  }
  for (const model of Object.values(mongoose.models)) {
    await model.createIndexes();
    console.log('Indexes checked: ' + model.modelName);
  }
} catch (error) {
  console.error('Index creation failed; review duplicate data or index conflicts. Code:', error.code || 'CONFIGURATION');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
