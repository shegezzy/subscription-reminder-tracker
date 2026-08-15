import { afterEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';

describe('MongoDB connection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects using the configured URI', async () => {
    vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

    await connectDatabase('mongodb://localhost:27017/subscription-reminder-test');

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/subscription-reminder-test',
      { serverSelectionTimeoutMS: 10_000 },
    );
  });

  it('propagates connection failures', async () => {
    vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('MongoDB unavailable'));

    await expect(connectDatabase('mongodb://localhost:27017/subscription-reminder-test')).rejects.toThrow(
      'MongoDB unavailable',
    );
  });
});
