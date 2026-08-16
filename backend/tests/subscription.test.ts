import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { SubscriptionModel } from '../src/models/subscription.model.js';

const config = {
  nodeEnv: 'test' as const,
  frontendUrl: 'http://localhost:3000',
  jwtAccessSecret: 'a'.repeat(32),
  jwtRefreshSecret: 'b'.repeat(32),
};
const ownerId = '64b000000000000000000001';
const otherUserId = '64b000000000000000000002';
const subscriptionId = '64b000000000000000000003';
const validSubscription = {
  name: 'Netflix',
  amount: 5000,
  currency: 'NGN',
  billingCycle: 'monthly',
  renewalDate: '2026-09-01',
  reminderDays: [3, 7],
};

function authCookie(userId = ownerId): string {
  return `accessToken=${jwt.sign({ sub: userId, email: 'user@example.com' }, config.jwtAccessSecret)}`;
}

function leanResult(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) };
}

function errorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('error' in body)) return undefined;
  const error = body.error;
  if (!error || typeof error !== 'object' || !('code' in error) || typeof error.code !== 'string')
    return undefined;
  return error.code;
}

describe('subscription API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires authentication for every subscription endpoint', async () => {
    const app = createApp(config);
    const responses = await Promise.all([
      request(app).get('/api/subscriptions'),
      request(app).post('/api/subscriptions').send(validSubscription),
      request(app).get(`/api/subscriptions/${subscriptionId}`),
      request(app).patch(`/api/subscriptions/${subscriptionId}`).send({ name: 'Max' }),
      request(app).delete(`/api/subscriptions/${subscriptionId}`),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
      expect(errorCode(response.body)).toBe('UNAUTHORIZED');
    }
  });

  it('creates a subscription for the authenticated user and rejects client-supplied ownership', async () => {
    const create = vi
      .spyOn(SubscriptionModel, 'create')
      .mockResolvedValue(
        SubscriptionModel.hydrate({ _id: subscriptionId, userId: ownerId, ...validSubscription }),
      );
    const app = createApp(config);

    const response = await request(app)
      .post('/api/subscriptions')
      .set('Cookie', authCookie())
      .send(validSubscription);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: ownerId, name: 'Netflix' }),
    );

    const injectionResponse = await request(app)
      .post('/api/subscriptions')
      .set('Cookie', authCookie())
      .send({ ...validSubscription, userId: otherUserId });

    expect(injectionResponse.status).toBe(400);
    expect(errorCode(injectionResponse.body)).toBe('VALIDATION_ERROR');
  });

  it('scopes list, read, update, and delete queries to the authenticated user', async () => {
    const find = vi.spyOn(SubscriptionModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    } as never);
    const findOne = vi
      .spyOn(SubscriptionModel, 'findOne')
      .mockReturnValue(leanResult({ _id: subscriptionId }) as never);
    const findOneAndUpdate = vi
      .spyOn(SubscriptionModel, 'findOneAndUpdate')
      .mockReturnValue(leanResult({ _id: subscriptionId, name: 'Max' }) as never);
    const findOneAndDelete = vi
      .spyOn(SubscriptionModel, 'findOneAndDelete')
      .mockReturnValue(leanResult({ _id: subscriptionId }) as never);
    const app = createApp(config);

    expect((await request(app).get('/api/subscriptions').set('Cookie', authCookie())).status).toBe(
      200,
    );
    expect(
      (await request(app).get(`/api/subscriptions/${subscriptionId}`).set('Cookie', authCookie()))
        .status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .patch(`/api/subscriptions/${subscriptionId}`)
          .set('Cookie', authCookie())
          .send({ name: 'Max' })
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .delete(`/api/subscriptions/${subscriptionId}`)
          .set('Cookie', authCookie())
      ).status,
    ).toBe(200);

    expect(find).toHaveBeenCalledWith({ userId: ownerId });
    expect(findOne).toHaveBeenCalledWith({ _id: subscriptionId, userId: ownerId });
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: subscriptionId, userId: ownerId },
      { $set: { name: 'Max' } },
      { new: true, runValidators: true },
    );
    expect(findOneAndDelete).toHaveBeenCalledWith({ _id: subscriptionId, userId: ownerId });
  });

  it("validates subscription payloads and does not reveal another user's subscription", async () => {
    vi.spyOn(SubscriptionModel, 'findOne').mockReturnValue(leanResult(null) as never);
    const app = createApp(config);

    const invalid = await request(app)
      .post('/api/subscriptions')
      .set('Cookie', authCookie())
      .send({ ...validSubscription, currency: 'CAD' });
    const notFound = await request(app)
      .get(`/api/subscriptions/${subscriptionId}`)
      .set('Cookie', authCookie(otherUserId));

    expect(invalid.status).toBe(400);
    expect(errorCode(invalid.body)).toBe('VALIDATION_ERROR');
    expect(notFound.status).toBe(404);
    expect(errorCode(notFound.body)).toBe('SUBSCRIPTION_NOT_FOUND');
  });
});
