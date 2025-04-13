// controllers/item.controller.js
const itemRepository = require('../repositories/item.repository');
const imageUploader = require('../utils/imageUploader');
const { sanitizeInput } = require('../utils/validation');
const logger = require('../utils/logger'); // Assume we have a logger utility

// Create a new item
exports.createItem = async (req, res) => {
  try {
    // Log the request information for debugging
    logger.info('Create item request received', {
      body: req.body,
      file: req.file ? req.file.originalname : 'No file'
    });
    
    let imageUrl = null;
    
    // Upload image if provided
    if (req.file) {
      logger.info('File detected, uploading to Cloudinary');
      try {
        imageUrl = await imageUploader.uploadImage(req.file);
        logger.info('Image uploaded successfully:', { imageUrl });
      } catch (uploadError) {
        logger.error('Image upload failed:', uploadError);
        return res.status(422).json({ error: 'Failed to upload image', details: uploadError.message });
      }
    }
    
    // Get item data from request body
    const { name, price, store_id, stock } = req.body;
    
    // Extra validation even though we have middleware
    if (!name || !price || !store_id) {
      logger.warn('Missing required fields in item creation');
      return res.status(400).json({ error: 'Missing required fields: name, price, and store_id are required' });
    }
    
    // Create item with image URL
    const newItem = await itemRepository.createItem({
      name: sanitizeInput(name),
      price: parseInt(price),
      store_id,
      image_url: imageUrl,
      stock: stock ? parseInt(stock) : 0
    });
    
    logger.info('Item created successfully:', { itemId: newItem.id });
    
    // Return only necessary data
    res.status(201).json({
      id: newItem.id,
      name: newItem.name,
      price: newItem.price,
      store_id: newItem.store_id,
      image_url: newItem.image_url,
      stock: newItem.stock,
      created_at: newItem.created_at
    });
  } catch (error) {
    logger.error('Error creating item:', error);
    
    // More specific error handling
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'Item with this name already exists in this store' });
    } else if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Store not found with provided ID' });
    }
    
    res.status(500).json({ error: 'Failed to create item', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get all items with pagination and filtering
exports.getAllItems = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Parse filtering and sorting
    const filters = {};
    if (req.query.min_price) filters.min_price = parseInt(req.query.min_price);
    if (req.query.max_price) filters.max_price = parseInt(req.query.max_price);
    if (req.query.name) filters.name = sanitizeInput(req.query.name);
    
    const sortBy = req.query.sort_by || 'created_at';
    const sortOrder = req.query.sort_order || 'DESC';
    
    // Get items with pagination
    const { items, totalCount } = await itemRepository.getAllItemsPaginated(
      limit, offset, filters, sortBy, sortOrder
    );
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      items,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit
      }
    });
  } catch (error) {
    logger.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }
    
    const item = await itemRepository.getItemById(id);
    
    if (!item) {
      logger.warn(`Item not found with ID: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    logger.error(`Error fetching item with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch item', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get items by store ID
exports.getItemsByStoreId = async (req, res) => {
  try {
    const { store_id } = req.params;
    
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store_id)) {
      return res.status(400).json({ error: 'Invalid store ID format' });
    }
    
    // Similar pagination as getAllItems
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { items, totalCount } = await itemRepository.getItemsByStoreIdPaginated(
      store_id, limit, offset
    );
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      items,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit
      }
    });
  } catch (error) {
    logger.error(`Error fetching items for store ${req.params.store_id}:`, error);
    res.status(500).json({ error: 'Failed to fetch items', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }
    
    const { name, price, store_id, stock } = req.body;
    
    // Check if item exists
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
      logger.warn(`Attempted to update non-existent item: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check user permissions (assume we have middleware that adds user to req)
    if (req.user && req.user.role !== 'admin' && existingItem.store_id !== req.user.store_id) {
      logger.warn(`Unauthorized update attempt on item ${id} by user ${req.user.id}`);
      return res.status(403).json({ error: 'You do not have permission to update this item' });
    }
    
    let imageUrl = existingItem.image_url;
    
    // Upload new image if provided
    if (req.file) {
      logger.info('Updating with new image file');
      try {
        // Delete old image if it exists
        if (existingItem.image_url) {
          await imageUploader.deleteImage(existingItem.image_url);
        }
        imageUrl = await imageUploader.uploadImage(req.file);
        logger.info('New image uploaded successfully:', { imageUrl });
      } catch (uploadError) {
        logger.error('Image upload failed during update:', uploadError);
        return res.status(422).json({ error: 'Failed to upload new image', details: uploadError.message });
      }
    }
    
    const updatedItem = await itemRepository.updateItem({
      id,
      name: name ? sanitizeInput(name) : existingItem.name,
      price: price ? parseInt(price) : existingItem.price,
      store_id: store_id || existingItem.store_id,
      image_url: imageUrl,
      stock: stock !== undefined ? parseInt(stock) : existingItem.stock
    });
    
    logger.info(`Item ${id} updated successfully`);
    res.status(200).json(updatedItem);
  } catch (error) {
    logger.error(`Error updating item ${req.params.id}:`, error);
    
    // Specific error handling
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Item with this name already exists in this store' });
    } else if (error.code === '23503') {
      return res.status(400).json({ error: 'Store not found with provided ID' });
    }
    
    res.status(500).json({ error: 'Failed to update item', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }
    
    // Check if item exists
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
      logger.warn(`Attempted to delete non-existent item: ${id}`);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check user permissions
    if (req.user && req.user.role !== 'admin' && existingItem.store_id !== req.user.store_id) {
      logger.warn(`Unauthorized delete attempt on item ${id} by user ${req.user.id}`);
      return res.status(403).json({ error: 'You do not have permission to delete this item' });
    }
    
    // Delete image if it exists
    if (existingItem.image_url) {
      try {
        await imageUploader.deleteImage(existingItem.image_url);
        logger.info(`Deleted image for item ${id}`);
      } catch (deleteError) {
        logger.error('Failed to delete image:', deleteError);
        // Continue with item deletion even if image deletion fails
      }
    }
    
    await itemRepository.deleteItem(id);
    logger.info(`Item ${id} deleted successfully`);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete item', message: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};