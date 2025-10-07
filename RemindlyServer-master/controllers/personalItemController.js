const PersonalItem = require('../models/personalItemsModels');
const User = require('../models/usersModels');



// Get a specific personal item by ID
const getPersonalItem = async (req, res) => {
  try {
    const item = await PersonalItem.findById(req.params.id);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Update a specific personal item
const updatePersonalItem = async (req, res) => {
  try {
    const updatedItem = await PersonalItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedItem) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.status(200).send(updatedItem);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Delete a specific personal item
const deletePersonalItem = async (req, res) => {
  try {
    const { id } = req.params; // Item ID to delete

    // Find and delete the item
    const deletedItem = await PersonalItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).send({ message: 'Item not found' });
    }

    // Update the user's personalItems array
    await User.updateOne(
      { personalItems: id }, // Find the user who has this item
      { $pull: { personalItems: id } } // Remove the item ID from the array
    );

    res.status(200).send({ message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getPersonalItem,
  updatePersonalItem,
  deletePersonalItem
};
