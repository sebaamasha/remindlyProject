const express = require('express');
const router = express.Router();
const ShoppingListController = require('../controllers/ShoppingListController');

// Get all shopping items for a specific user
router.get('/alllist/:userId', ShoppingListController.getShoppingListForUser);


router.get('/:userId/:id', ShoppingListController.getShoppingItem);

// Add a new shopping item for a specific user
router.post('/:userId', ShoppingListController.addShoppingItem);

// Update a specific personal item
router.put('/:itemId', ShoppingListController.updateShoppingItem);

// Delete a specific personal item from the shopping list of a user
router.delete('/:userId/:itemId', ShoppingListController.deleteShoppingItem);

module.exports = router;
