const express = require('express');
const router = express.Router();
const personalItemController = require('../controllers/personalItemController');


router.get('/:id', personalItemController.getPersonalItem); // Get a personal item by ID
router.put('/:id', personalItemController.updatePersonalItem); // Update a personal item by ID
router.delete('/:id', personalItemController.deletePersonalItem); 

module.exports = router;
