const ReminderLocation = require('../models/reminderLocationModel');
const User = require('../models/usersModels');


// Get a specific location reminder by ID
const getReminderLocation = async (req, res) => {
  try {
    const reminder = await ReminderLocation.findById(req.params.id);
    if (!reminder) {
      return res.status(404).send({ message: 'Reminder not found' });
    }
    res.status(200).send(reminder);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Update a specific location reminder
const updateReminderLocation = async (req, res) => {
  try {
    const updatedReminder = await ReminderLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedReminder) {
      return res.status(404).send({ message: 'Reminder not found' });
    }
    res.status(200).send(updatedReminder);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Delete a specific location reminder
const deleteReminderLocation = async (req, res) => {
  try {
    const { id } = req.params; // Reminder ID to delete

    // Find the reminder to ensure it exists
    const reminder = await ReminderLocation.findById(id);
    if (!reminder) {
      return res.status(404).send({ message: 'Reminder not found' });
    }

    // Remove the reminder from the ReminderLocation collection
    await ReminderLocation.findByIdAndDelete(id);

    // Find the user who owns this reminder and remove it from their array
    await User.updateOne(
      { locationReminders: id },
      { $pull: { locationReminders: id } }
    );

    res.status(200).send({ message: 'Reminder deleted and user updated successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getReminderLocation,
  updateReminderLocation,
  deleteReminderLocation
};
