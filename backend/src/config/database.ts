import mongoose from 'mongoose';

export async function connectDatabase(mongoUri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 });
  console.info('MongoDB connection established');
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  console.info('MongoDB connection closed');
}
