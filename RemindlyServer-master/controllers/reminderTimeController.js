const ReminderTime = require('../models/reminderTimeModel');
const User = require('../models/usersModels');


const getReminderTime = async (req, res) => {
  try {
    const reminder = await ReminderTime.findById(req.params.id);
    if (!reminder) return res.status(404).send({ message: 'Reminder not found' });
    res.send(reminder);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const updateReminderTime = async (req, res) => {
  try {
    const updatedReminder = await ReminderTime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReminder) return res.status(404).send({ message: 'Reminder not found' });
    res.send(updatedReminder);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const deleteReminderTime = async (req, res) => {
  try {
    const { id } = req.params; // Reminder ID to delete

    // Find and delete the reminder
    const deletedReminder = await ReminderTime.findByIdAndDelete(id);
    if (!deletedReminder) {
      return res.status(404).send({ message: 'Reminder not found' });
    }

    // Update the user's timeReminders array
    await User.updateOne(
      { timeReminders: id }, // Find the user who has this reminder
      { $pull: { timeReminders: id } } // Remove the reminder ID from the array
    );

    res.status(200).send({ message: 'Reminder deleted successfully', deletedReminder });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getReminderTime,
  updateReminderTime,
  deleteReminderTime
};
