import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list User Profile', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Kevin Pagliuca',
      email: 'kevin.pagliuca@outlook.com',
      password: 'admin',
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'kevin.pagliuca@outlook.com',
      password: 'admin',
    });

    const { token } = response.body;

    const result = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.body).toHaveProperty('id');
    expect(result.status).toBe(200);
  });
  it('should not be able to list User Profile not existing', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer not Existing`,
    });

    expect(response.status).toBe(401);
  });
});
