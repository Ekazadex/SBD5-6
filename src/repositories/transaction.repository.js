const db = require('../database/db.js');

class TransactionRepository {
  // Find transaction by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.findById:', error);
      throw error;
    }
  }
  
  // Create a new transaction
  static async create(user_id, item_id, quantity, total) {
    try {
      // Log untuk debugging
      console.log('Creating transaction with params:', { user_id, item_id, quantity, total });
      
      // Menggunakan status default 'pending' jika tidak ada field status di tabel
      const result = await db.query(
        'INSERT INTO transactions (user_id, item_id, quantity, total, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, item_id, quantity, total, 'pending']
      );
      
      if (result.rows.length === 0) {
        throw new Error('No rows returned after insert');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.create:', error);
      // Dapatkan detail error untuk debugging
      const errorDetail = error.stack || error.message || 'Unknown error';
      console.error('Error detail:', errorDetail);
      
      throw error;
    }
  }
  
  // Update transaction status
  static async updateStatus(id, status) {
    try {
      const result = await db.query(
        'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.updateStatus:', error);
      throw error;
    }
  }
  
  // Delete a transaction
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM transactions WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.delete:', error);
      throw error;
    }
  }

  // Get all transactions
  static async getAllTransactions() {
    // Query dengan JOIN untuk mendapatkan data transaksi lengkap dengan user dan item
      const query = `
      SELECT 
        t.id, 
        t.user_id, 
        t.item_id, 
        t.quantity, 
        t.total, 
        t.status, 
        t.created_at,
        u.id as u_id, 
        u.name as u_name, 
        u.email as u_email, 
        u.password as u_password, 
        u.balance as u_balance, 
        u.created_at as u_created_at,
        i.id as i_id, 
        i.name as i_name, 
        i.price as i_price, 
        i.store_id as i_store_id, 
        i.image_url as i_image_url, 
        i.stock as i_stock, 
        i.created_at as i_created_at
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN items i ON t.item_id = i.id
    `;
    
    const result = await db.query(query);
    
    // Transform data menjadi format yang diinginkan
    const transactions = result.rows.map(row => {
      return {
        id: row.id,
        user_id: row.user_id,
        item_id: row.item_id,
        quantity: row.quantity,
        total: row.total,
        status: row.status,
        created_at: row.created_at,
        user: {
          id: row.u_id,
          name: row.u_name,
          email: row.u_email,
          password: row.u_password,
          balance: row.u_balance,
          created_at: row.u_created_at
        },
        item: {
          id: row.i_id,
          name: row.i_name,
          price: row.i_price,
          store_id: row.i_store_id,
          image_url: row.i_image_url,
          stock: row.i_stock,
          created_at: row.i_created_at
        }
      };
    });
    
    return transactions;
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    throw error;
  }
}

module.exports = TransactionRepository;