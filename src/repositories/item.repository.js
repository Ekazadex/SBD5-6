const db = require('../database/db');

class ItemRepository {
  // Find all items
  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM items ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error in ItemRepository.findAll:', error);
      throw error;
    }
  }

  // Find item by ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM items WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.findById:', error);
      throw error;
    }
  }

  // Find items by store ID
  static async findByStoreId(storeId) {
    try {
      const result = await db.query(
        'SELECT * FROM items WHERE store_id = $1 ORDER BY created_at DESC',
        [storeId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in ItemRepository.findByStoreId:', error);
      throw error;
    }
  }

  // Create a new item
  static async create(name, price, store_id, image_url, stock) {
    try {
      const result = await db.query(
        'INSERT INTO items (name, price, store_id, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, price, store_id, image_url, stock]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.create:', error);
      throw error;
    }
  }

  // Update an item
  static async update(id, name, price, store_id, image_url, stock) {
    try {
      const result = await db.query(
        'UPDATE items SET name = $1, price = $2, store_id = $3, image_url = $4, stock = $5 WHERE id = $6 RETURNING *',
        [name, price, store_id, image_url, stock, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.update:', error);
      throw error;
    }
  }

  // Update item stock
  static async updateStock(id, newStock) {
    try {
      const result = await db.query(
        'UPDATE items SET stock = $1 WHERE id = $2 RETURNING *',
        [newStock, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.updateStock:', error);
      throw error;
    }
  }

  // Delete an item
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM items WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.delete:', error);
      throw error;
    }
  }
}

module.exports = ItemRepository;