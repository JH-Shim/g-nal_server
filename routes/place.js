const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');

router.get('/', placeController.index);
router.get('/:placeId', placeController.placeId);

module.exports = router;
