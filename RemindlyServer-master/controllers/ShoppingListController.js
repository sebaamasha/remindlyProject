const ShoppingItem = require('../models/personalItemsModels');
const User = require('../models/usersModels');

// Get a specific personal item by ID
const getShoppingItem = async (req, res) => {
  try {
    const { userId, id } = req.params;

    // Find the user to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the item exists in the user's ShoppingItems
    if (!user.ShopingList.includes(id)) {
      return res.status(404).send({ message: 'Item not associated with this user' });
    }

    // Find the item by ID
    const item = await ShoppingItem.findById(id);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    res.status(200).send(item);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};



// Get all shopping items for a specific user
const getShoppingListForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('ShopingList');

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user.ShopingList);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Update a specific personal item
const updateShoppingItem = async (req, res) => {
  try {
    
    const updatedItem = await ShoppingItem.findByIdAndUpdate(
      req.params.itemId,
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
const deleteShoppingItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params; // User ID and Item ID to delete

    // Find the user to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the item exists in the user's ShoppingItems array
    if (!user.ShopingList.includes(itemId)) {
      return res.status(404).send({ message: 'Item not associated with this user' });
    }

    // Remove the item ID from the user's ShoppingItems array
    user.ShopingList = user.ShopingList.filter(
      (item) => item.toString() !== itemId
    );
    await user.save();

    // Find and delete the item from the ShoppingItem collection
    const deletedItem = await ShoppingItem.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).send({ message: 'Item not found' });
    }

    res.status(200).send({ message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// Add a new shopping item
const addShoppingItem = async (req, res) => {
  try {
    const { userId } = req.params; // Item ID to delete
    const {itemName, qty, days, address } = req.body;

    // Create a new shopping item
    const newItem = new ShoppingItem({
      itemName,
      qty,
      days,
      address
    });

    await newItem.save();

    // Add the item to the user's ShoppingItems array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.ShopingList.push(newItem._id);
    await user.save();

    res.status(201).send({ message: 'Item added successfully', newItem });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

module.exports = {
  getShoppingItem,
  getShoppingListForUser,
  updateShoppingItem,
  deleteShoppingItem,
  addShoppingItem
};
