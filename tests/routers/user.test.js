const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../../src/app')
const User = require('../../src/models/user')
const mongoose = require('mongoose');
const { SECRET } = require('../../src/config');

const userId = new mongoose.Types.ObjectId()
const userData = {
  _id: userId,
  name: 'foobar',
  email: 'foobar@test.com',
  password: 'Test!@#',
  tokens: [
    {
      token: jwt.sign({_id: userId.toString()}, SECRET)
    },
    {
      token: jwt.sign({_id: userId.toString()}, SECRET)
    }
  ]
}

afterAll(async ()=>{
  await mongoose.connection.close();
})

beforeEach(async ()=>{
  await User.deleteMany()
})

describe('POST /users', function() {
  it('creates a user successfully', async () => {
    const response = await request(app).post('/users').send({
      name: 'foobar',
      email: 'foobar@test.com',
      password: 'Test!@#'
    })
    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user.age', 0)
    expect(response.body).toHaveProperty('user.name', 'foobar')
    expect(response.body).toHaveProperty('user.email', 'foobar@test.com')
  })

  it('does not create a duplicated user', async () => {
    const userData = {
      name: 'foobar',
      email: 'foobar@test.com',
      password: 'Test!@#'
    }

    await new User(userData).save()

    const response = await request(app).post('/users').send(userData)

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /users/login', function() {
  it('logs in successfully', async () => {
    const userData = {
      name: 'foobar',
      email: 'foobar@test.com',
      password: 'Test!@#'
    }

    await new User(userData).save()

    const response = await request(app).post('/users/login').send(userData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('user.age', 0)
    expect(response.body).toHaveProperty('user.name', 'foobar')
    expect(response.body).toHaveProperty('user.email', 'foobar@test.com')
  })

  it('does not login because wrong credentials', async () => {
    const userData = {
      name: 'foobar',
      email: 'foobar@test.com',
      password: 'Test!@#'
    }

    await new User(userData).save()

    const response = await request(app).post('/users/login').send({
      email: 'foobar@test.com',
      password: 'not_right'
    })
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({error: "Unable to login"})
  })

  it('does not login because user does not exist', async () => {
    const response = await request(app).post('/users').send({
      email: 'email@doesnot.exist',
      password: 'none'
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('POST /users/logout_all', function() {
  beforeEach(async () => {
    user = await new User(userData).save()
  })

  it('logs out successfully', async () => {
    expect(user.tokens.length).toBe(2)

    const response = await request(app)
      .post('/users/logout_all')
      .set('Authorization', `Bearer ${user.tokens[0].token}`)
      .send()

    expect(response.statusCode).toBe(200)

    user = await User.findById(user._id)
    expect(user.tokens).toEqual(expect.arrayContaining([]))
  })

  it('tries to logs out without credentions', async () => {
    const response = await request(app)
      .post('/users/logout_all')
      .send()

    expect(response.statusCode).toBe(401)
    user = await User.findById(user._id)
    expect(user.tokens.length).toBe(2)
  })
})

describe('DELETE /users/me', function() {
  beforeEach(async () => {
    user = await new User(userData).save()
  })

  it('deletes user successfully', async () => {
    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${user.tokens[0].token}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('age', 0)
    expect(response.body).toHaveProperty('name', 'foobar')
    expect(response.body).toHaveProperty('email', 'foobar@test.com')
    user = await User.findById(userId)
    expect(user).toBeNull()
  })

  it('tries to delete a user without credentions', async () => {
    const response = await request(app)
      .delete('/users/me')
      .send()

    expect(response.statusCode).toBe(401)
    user = await User.findById(user._id)
    expect(user.tokens.length).toBe(2)
  })
})
