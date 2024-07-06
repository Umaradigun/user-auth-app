// controllers/authController.js

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organisation = require('../models/organisation');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { userId, firstName, lastName, email, password, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({
        status: 'Bad request',
        message: 'Registration unsuccessful: User already exists',
        statusCode: 400,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = await User.create({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    // Create default organisation
    const orgId = 'org_' + Math.random().toString(36).substr(2, 9);
    const organisation = await Organisation.create({
      orgId,
      name: `${firstName}'s Organisation`,
      description: `${firstName}'s default organisation`,
    });

    await organisation.addUser(user);

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Internal Server Error',
      message: 'Registration unsuccessful',
      statusCode: 500,
    });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Authentication failed: Incorrect password',
        statusCode: 401,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Internal Server Error',
      message: 'Authentication failed',
      statusCode: 500,
    });
  }
};
