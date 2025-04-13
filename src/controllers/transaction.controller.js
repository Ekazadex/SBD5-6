const TransactionRepository = require('../repositories/transaction.repository.js');
const UserRepository = require('../repositories/user.repository.js');
const ItemRepository = require('../repositories/item.repository.js');
const BaseResponse = require('../utils/baseResponse.util.js');

class TransactionController {
  constructor() {
    // Inisialisasi repository di constructor
    this.transactionRepository = new TransactionRepository();
  }

  // Create a new transaction
  static async createTransaction(req, res) {
    try {
      const bodyData = req.body || {};
      
      // Ambil data dari body
      const user_id = bodyData.user_id;
      const item_id = bodyData.item_id;
      const quantityInput = bodyData.quantity;
      
      console.log('Request data:', { user_id, item_id, quantity: quantityInput });
      
      // Validasi required fields
      if (!user_id || !item_id || !quantityInput) {
        return res.status(400).json(
          BaseResponse.error("User ID, item ID, and quantity are required")
        );
      }
      
      // Konversi quantity ke number dan validasi
      const quantity = parseInt(quantityInput);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json(
          BaseResponse.error("Quantity must be a positive number")
        );
      }
      
      // Check if user exists
      const user = await UserRepository.findById(user_id);
      console.log('User found:', user);
      if (!user) {
        return res.status(404).json(
          BaseResponse.error("User not found")
        );
      }
      
      // Check if item exists
      const item = await ItemRepository.findById(item_id);
      console.log('Item found:', item);
      if (!item) {
        return res.status(404).json(
          BaseResponse.error("Item not found")
        );
      }
      
      // Calculate total price
      const total = item.price * quantity;
      console.log('Calculated total:', total);
      
      // Create transaction with pending status (default)
      const transaction = await TransactionRepository.create(user_id, item_id, quantity, total);
      console.log('Transaction created:', transaction);
      
      return res.status(201).json(
        BaseResponse.success("Transaction created", transaction)
      );
    } catch (error) {
      console.error('Error in createTransaction:', error);
      // Dapatkan detail error untuk debugging
      const errorDetail = error.stack || error.message || 'Unknown error';
      console.error('Error detail:', errorDetail);
      
      return res.status(500).json(
        BaseResponse.error("Error creating transaction")
      );
    }
  }
  
  // Pay for a transaction
  static async payTransaction(req, res) {
    try {
      const transaction_id = req.params.id; // Get the transaction ID from URL
      
      if (!transaction_id) {
        return res.status(400).json(
          BaseResponse.error("Transaction ID is required")
        );
      }
      
      // Find the transaction
      const transaction = await TransactionRepository.findById(transaction_id);
      if (!transaction) {
        return res.status(404).json(
          BaseResponse.error("Transaction not found")
        );
      }
      
      // Update transaction status to 'paid'
      const updatedTransaction = await TransactionRepository.updateStatus(transaction_id, 'paid');
      
      return res.status(200).json(
        BaseResponse.success("Payment processed successfully", updatedTransaction)
      );
    } catch (error) {
      console.error('Error in payTransaction:', error);
      return res.status(500).json(
        BaseResponse.error("Error processing payment")
      );
    }
  }
  
  // Delete a transaction
  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;
      
      // Check if transaction exists
      const transaction = await TransactionRepository.findById(id);
      if (!transaction) {
        return res.status(404).json(
          BaseResponse.error("Transaction not found")
        );
      }
      
      // Only paid transactions can be deleted
      if (transaction.status === 'pending') {
        return res.status(400).json(
          BaseResponse.error("Paid transactions cannot be deleted")
        );
      }
      
      // Delete transaction
      const deletedTransaction = await TransactionRepository.delete(id);
      
      return res.status(200).json(
        BaseResponse.success("Transaction deleted", deletedTransaction)
      );
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      return res.status(500).json(
        BaseResponse.error("Error deleting transaction")
      );
    }
  }

  static async getTransaction(req, res) {
    const transactions = await TransactionRepository.getAllTransactions();
    return res.json(BaseResponse.success("Transactions found", transactions));
  } catch (error) {
    console.error("Error getting transactions:", error);
    return res.status(500).json(BaseResponse.error("Failed to get transactions", error.message));
  }
}

module.exports = TransactionController;