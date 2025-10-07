const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderTimeController');


router.get('/:id', reminderController.getReminderTime); // Get a time reminder by ID
router.put('/:id', reminderController.updateReminderTime); // Update a time reminder by ID
router.delete('/:id', reminderController.deleteReminderTime);

module.exports = router;
