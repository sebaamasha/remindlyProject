const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/usersModels');
const ReminderTime = require('../models/reminderTimeModel');
const ReminderLocation = require('../models/reminderLocationModel');
const PersonalItem = require('../models/personalItemsModels');

exports.registerUser = async (req, res) => {
    try {
        const { username, password,address ,gender} = req.body;

        if (!username || !password || !address) {
            return res.status(400).json({ error: "Missing required fields, including password." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

     
            const newUser = new User({
                username,
                password: hashedPassword,
                address,
                gender
            });
            await newUser.save();
            return res.status(201).json({ message: "User registered successfully", user: newUser });
        
    } catch (err) {
        console.error("Error registering user:", err.message);
        res.status(500).json({ error: "Internal server error => ",
                                errormassae : err.message,
                                err : err
        });
    }
};

exports.login = async (req, res) => {
    try {
        const {  username, password } = req.body;

        const userModel = User;
        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid credentials");
            return res.status(401).json({ error: 'Wrong Password' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '10m' }
        );
        console.log("Login successful");
        res.status(200).json({ user });
    } catch (err) {
        console.error("Failed to log in:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.addTimeReminderToUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Create the new time reminder
      const reminder = new ReminderTime(req.body);
      const savedReminder = await reminder.save();
  
      // Add the reminder's ID to the user's timeReminders list
      user.timeReminders.push(savedReminder._id);
      await user.save();
  
      // Send the updated user and the new reminder as the response
      res.status(201).send({ user, reminder: savedReminder });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate('timeReminders')
        .populate('locationReminders')
        .populate('personalItems');
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  exports.addTimeReminderToUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).send({ message: 'User not found' });
  
      const reminder = new ReminderTime(req.body);
      const savedReminder = await reminder.save();
  
      user.timeReminders.push(savedReminder._id);
      await user.save();
  
      res.status(201).send({ user, reminder: savedReminder });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  exports.addLocationReminderToUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).send({ message: 'User not found' });
  
      const reminder = new ReminderLocation(req.body);
      const savedReminder = await reminder.save();
  
      user.locationReminders.push(savedReminder._id);
      await user.save();
  
      res.status(201).send({ user, reminder: savedReminder });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };
  
  exports.addPersonalItemToUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).send({ message: 'User not found' });
  
      const item = new PersonalItem(req.body);
      const savedItem = await item.save();
  
      user.personalItems.push(savedItem._id);
      await user.save();
  
      res.status(201).send({ user, item: savedItem });
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  };

  exports.deleteUserWithReminders = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user to ensure they exist
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Delete all associated reminders and items
      await ReminderTime.deleteMany({ _id: { $in: user.timeReminders } }); // Delete time reminders
      await ReminderLocation.deleteMany({ _id: { $in: user.locationReminders } }); // Delete location reminders
      await PersonalItem.deleteMany({ _id: { $in: user.personalItems } }); // Delete personal items
  
      // Delete the user
      await User.findByIdAndDelete(userId);
  
      res.status(200).send({ message: 'User, associated reminders, and items deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.getAllRemindersForUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user and populate their reminders
      const user = await User.findById(userId)
        .populate('timeReminders') // Populate time reminders
        .populate('locationReminders'); // Populate location reminders
  
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Combine all reminders into a single object
      const reminders = {
        timeReminders: user.timeReminders,
        locationReminders: user.locationReminders
      };
  
      res.status(200).send({ message: 'Reminders retrieved successfully', reminders });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };


exports.getAllPersonalItemsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate their personal items
    const user = await User.findById(userId).populate('personalItems');

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Send the personal items
    res.status(200).send({ message: 'Personal items retrieved successfully', personalItems: user.personalItems });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

