import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able list the balance all of the user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Kevin Pagliuca',
      email: 'kevin.pagliuca@outlook.com',
      password: 'admin',
    });

    const responseSession = await request(app).post('/api/v1/sessions').send({
      email: 'kevin.pagliuca@outlook.com',
      password: 'admin',
    });

    const { token } = responseSession.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 5,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('statement');
    expect(response.status).toBe(200);
  });

  it('should not be ble list the balance without user', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer token invalid`,
    });

    expect(response.body).toHaveProperty('message');
    expect(response.status).toBe(401);
  });
});
