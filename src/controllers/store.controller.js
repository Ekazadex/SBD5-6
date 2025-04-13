const StoreRepository = require('../repositories/store.repository.js');
const BaseResponse = require('../utils/baseResponse.util.js');

class StoreController {
  // Get all stores
  static async getAllStores(req, res) {
    try {
      const stores = await StoreRepository.getAllStores();
      return res.status(200).json(
        BaseResponse.success("Stores found", stores)
      );
    } catch (error) {
      console.error('Error in getAllStores:', error);
      return res.status(500).json(
        BaseResponse.error("Error retrieving stores", error)
      );
    }
  }

  // Get store by ID
  static async getStoreById(req, res) {
    try {
      const { id } = req.params;
      const store = await StoreRepository.getStoreById(id);
      
      if (!store) {
        return res.status(404).json(
          BaseResponse.error("Store not found")
        );
      }
      
      return res.status(200).json(
        BaseResponse.success("Store found", store)
      );
    } catch (error) {
      console.error('Error in getStoreById:', error);
      return res.status(500).json(
        BaseResponse.error("Error retrieving store")
      );
    }
  }

  // Create store
  static async createStore(req, res) {
    try {
      const { name, address } = req.body;
      
      // Validate required fields
      if (!name || !address) {
        return res.status(400).json(
          BaseResponse.error("Store name and address are required")
        );
      }
      
      // Create store
      const store = await StoreRepository.createStore({ name, address });
      
      return res.status(201).json(
        BaseResponse.success("Store created", store)
      );
    } catch (error) {
      console.error('Error in createStore:', error);
      return res.status(500).json(
        BaseResponse.error("Error creating store")
      );
    }
  }

  // Update store
  static async updateStore(req, res) {
    try {
      // Extract ID and other details from request body
      const { id, name, address } = req.body;
      
      // Validate that ID exists
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required",
          payload: null
        });
      }

      // First check if the store exists
      const existingStore = await StoreRepository.getStoreById(id);
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
          payload: null
        });
      }
      
      // Update the store
      const updatedStore = await StoreRepository.updateStore(id, { name, address });
      
      if (!updatedStore) {
        return res.status(500).json({
          success: false,
          message: "Failed to update store",
          payload: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Store updated successfully",
        payload: updatedStore
      });
    } catch (error) {
      console.error('Error in updateStore:', error);
      return res.status(500).json({
        success: false,
        message: "Error updating store: " + error.message,
        payload: null
      });
    }
  }

  // Delete store
  static async deleteStore(req, res) {
    try {
      const { id } = req.params;
      
      // Check if store exists
      const existingStore = await StoreRepository.getStoreById(id);
      if (!existingStore) {
        return res.status(404).json(
          BaseResponse.error("Store not found")
        );
      }
      
      // Delete store
      const deletedStore = await StoreRepository.deleteStore(id);
      
      return res.status(200).json(
        BaseResponse.success("Store deleted successfully", deletedStore)
      );
    } catch (error) {
      console.error('Error in deleteStore:', error);
      return res.status(500).json(
        BaseResponse.error("Error deleting store")
      );
    }
  }
}

module.exports = StoreController;