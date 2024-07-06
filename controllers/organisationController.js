// controllers/organisationController.js

const { validationResult } = require('express-validator');
const Organisation = require('../models/organization');
const User = require('../models/user');

exports.createOrganisation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const orgId = 'org_' + Math.random().toString(36).substr(2, 9);
    const organisation = await Organisation.create({
      orgId,
      name,
      description
    });

    return res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation
    });
  } catch (error) {
    return res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400
    });
  }
};

exports.addUserToOrganisation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { userId } = req.body;
  const { orgId } = req.params;

  try {
    const organisation = await Organisation.findByPk(orgId);
    if (!organisation) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'Organisation not found',
        statusCode: 404
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        message: 'User not found',
        statusCode: 404
      });
    }

    await organisation.addUser(user);

    return res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully'
    });
  } catch (error) {
    return res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400
    });
  }
};
