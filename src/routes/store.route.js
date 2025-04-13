const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store.controller.js');

// GET routes
router.get('/getAll', StoreController.getAllStores);
router.get('/', StoreController.getAllStores);
router.get('/:id', StoreController.getStoreById);

// POST route
router.post('/create', StoreController.createStore);

// PUT route
router.put('/', StoreController.updateStore);

// DELETE route
router.delete('/:id', StoreController.deleteStore);

module.exports = router;