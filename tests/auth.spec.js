const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const sequelize = require('../config/database');

describe('Auth Endpoints', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('should register user successfully with default organisation', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        userId: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data.user).to.have.property('userId', 'user1');
    expect(res.body.data.user).to.have.property('firstName', 'John');
    expect(res.body.data.user).to.have.property('lastName', 'Doe');
    expect(res.body.data.user      ).to.have.property('email', 'john.doe@example.com');
    expect(res.body.data.user).to.have.property('phone', '1234567890');
    expect(res.body.data).to.have.property('accessToken');
  });

  it('should log the user in successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data.user).to.have.property('userId', 'user1');
    expect(res.body.data.user).to.have.property('firstName', 'John');
    expect(res.body.data.user).to.have.property('lastName', 'Doe');
    expect(res.body.data.user).to.have.property('email', 'john.doe@example.com');
    expect(res.body.data.user).to.have.property('phone', '1234567890');
    expect(res.body.data).to.have.property('accessToken');
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        userId: 'user2',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
      });

    expect(res.status).to.equal(422);
    expect(res.body).to.have.property('errors');
    expect(res.body.errors).to.be.an('array').that.is.not.empty;
  });

  it('should fail if there’s a duplicate email or userId', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        userId: 'user1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'Bad request');
    expect(res.body).to.have.property('message', 'Registration unsuccessful');
  });
});

