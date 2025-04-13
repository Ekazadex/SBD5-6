const db = require('../database/db');

class UserRepository {
  // Find all users
  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM users');
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Create new user
  static async create(name, email, password) {
    try {
      const result = await db.query(
        'INSERT INTO users (name, email, password, balance) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, password, 0]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, name, email, password) {
    try {
      const result = await db.query(
        'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *',
        [name, email, password, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Update user balance
  static async updateBalance(id, newBalance) {
    try {
      const query = 'UPDATE users SET balance = $1 WHERE id = $2 RETURNING id, name, email, balance';
      const result = await db.query(query, [newBalance, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateBalance:', error);
      throw error;
    }
  }
}

module.exports = UserRepository;