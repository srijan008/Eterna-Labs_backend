
const express = require('express');
const router = express.Router();
const { executeOrder } = require('../../controllers/orderController');

router.post('/execute', executeOrder);

module.exports = router;
