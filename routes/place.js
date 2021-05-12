const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');

router.post('/', placeController.index);

module.exports = router;
