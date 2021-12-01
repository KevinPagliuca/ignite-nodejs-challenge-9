import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to do deposit', async () => {
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

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
        description: 'Deposit',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('id');
    expect(response.status).toBe(201);
  });

  it('should be able to do withdraw the money', async () => {
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

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 5,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('id');
    expect(response.status).toBe(201);
  });
  it('should not be able to deposit without user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 10,
        description: 'Deposit',
      })
      .set({
        Authorization: `Bearer token invalid`,
      });

    expect(response.body).toHaveProperty('message');
    expect(response.status).toBe(401);
  });
  it('should not be able to withdraw the money without user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 10,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer token invalid`,
      });

    expect(response.body).toHaveProperty('message');
    expect(response.status).toBe(401);
  });

  it('should not be able to withdraw money less than the balance', async () => {
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

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 1000,
        description: 'withdraw',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('message');
    expect(response.status).toBe(400);
  });
});
