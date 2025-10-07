const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderLocationController');


router.get('/:id', reminderController.getReminderLocation); // Get a location reminder by ID
router.put('/:id', reminderController.updateReminderLocation); // Update a location reminder by ID
router.delete('/:id', reminderController.deleteReminderLocation);
module.exports = router;
