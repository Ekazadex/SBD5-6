const db = require('../database/db');

class StoreRepository {
  // Get all stores
  static async getAllStores() {
    try {
      const result = await db.query('SELECT * FROM stores');
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Get store by ID
  static async getStoreById(id) {
    try {
      const result = await db.query('SELECT * FROM stores WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Create store
  static async createStore(store) {
    try {
      const result = await db.query(
        'INSERT INTO stores (name, address) VALUES ($1, $2) RETURNING *',
        [store.name, store.address]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Update store
static async updateStore(id, store) {
  try {
    const result = await db.query(
      'UPDATE stores SET name = $2, address = $3 WHERE id = $1 RETURNING *',
      [id, store.name, store.address]
    );
    
    // Check if any rows were affected
    if (result.rows.length === 0) {
      console.log(`No store found with ID: ${id}`);
      return null;  // Return null if no store was updated
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

  // Delete store
  static async deleteStore(id) {
    try {
      const result = await db.query('DELETE FROM stores WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
}

module.exports = StoreRepository;