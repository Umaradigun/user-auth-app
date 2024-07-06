// routes/organisation.js

const express = require('express');
const { body } = require('express-validator');
const organisationController = require('../controllers/organisationController');
const authMiddleware = require('../middleware/authenticate');

const router = express.Router();

// Create a new organisation
router.post(
  '/',
  authMiddleware,
  [body('name').not().isEmpty().withMessage('Name is required')],
  organisationController.createOrganisation
);

// Add a user to an organisation
router.post(
  '/:orgId/users',
  authMiddleware,
  [body('userId').not().isEmpty().withMessage('User ID is required')],
  organisationController.addUserToOrganisation
);

module.exports = router;
