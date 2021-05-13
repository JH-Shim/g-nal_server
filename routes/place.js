const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');

router.post('/', placeController.index);
router.post('/:id', placeController.place);

module.exports = router;
