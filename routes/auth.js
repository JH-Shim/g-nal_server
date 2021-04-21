const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/signup', authController.signup);
router.post('/isemail', authController.isEmail);
router.post('/institution', authController.institution);
router.post('/hashtest', authController.hashTest);

module.exports = router;
