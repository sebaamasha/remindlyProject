const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.login);
router.post('/:userId/time-reminders', userController.addTimeReminderToUser); // Add a time reminder to a user
router.post('/:userId/location-reminders', userController.addLocationReminderToUser); // Add a location reminder to a user
router.post('/:userId/personal-items', userController.addPersonalItemToUser); 
router.get('/:id', userController.getUser);
router.get('/:userId/reminders', userController.getAllRemindersForUser);
router.delete('/:userId', userController.deleteUserWithReminders); 
router.get('/:userId/personal-items', userController.getAllPersonalItemsForUser); // Get all personal items for a user



module.exports = router;