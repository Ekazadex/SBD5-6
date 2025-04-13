const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller.js');

// Make sure each route has a controller function as the second parameter
// Create transaction
router.post('/create', TransactionController.createTransaction);

// Pay for transaction
router.post('/pay/:id', TransactionController.payTransaction);

// Delete transaction
router.delete('/:id', TransactionController.deleteTransaction);

// Get all transactions
router.get('/', TransactionController.getTransaction);

module.exports = router;