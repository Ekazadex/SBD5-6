const UserRepository = require('../repositories/user.repository.js');
const { hashPassword } = require('../utils/passwordUtils');
const BaseResponse = require('../utils/baseResponse.util.js');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePassword } = require('../utils/validation.js');

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await UserRepository.findAll();
      return res.status(200).json(
        BaseResponse.success("Users found", users)
      );
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return res.status(500).json(
        BaseResponse.error("Error retrieving users")
      );
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findById(id);
      
      if (!user) {
        return res.status(404).json(
          BaseResponse.error("User not found")
        );
      }
      
      return res.status(200).json(
        BaseResponse.success("User found", user)
      );
    } catch (error) {
      console.error('Error in getUserById:', error);
      return res.status(500).json(
        BaseResponse.error("Error retrieving user")
      );
    }
  }

  // Get user by email
  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UserRepository.findByEmail(email);
      
      if (!user) {
        return res.status(404).json(
          BaseResponse.error("User not found")
        );
      }
      
      return res.status(200).json(
        BaseResponse.success("User found", user)
      );
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return res.status(500).json(
        BaseResponse.error("Error retrieving user")
      );
    }
  }

  // Register user
  static async register(req, res) {
    try {
      const { name, email, password } = req.body || {};
      
      // Extract from query if not in body
      const nameQuery = req.query.name;
      const emailQuery = req.query.email;
      const passwordQuery = req.query.password;
      
      const finalName = name || nameQuery;
      const finalEmail = email || emailQuery;
      const finalPassword = password || passwordQuery;
      
      // Validate required fields
      if (!finalName || !finalEmail || !finalPassword) {
        return res.status(400).json(
          BaseResponse.error("Missing required fields")
        );
      }
      
      // Validate email format using regex
      if (!validateEmail(finalEmail)) {
        return res.status(400).json(
          BaseResponse.error("Format email tidak valid")
        );
      }
      
      // Validate password strength using regex
      if (!validatePassword(finalPassword)) {
        return res.status(400).json(
          BaseResponse.error("Password harus minimal 8 karakter, mengandung minimal 1 angka dan 1 karakter spesial")
        );
      }
      
      // Check if email is already in use
      const existingUser = await UserRepository.findByEmail(finalEmail);
      if (existingUser) {
        return res.status(400).json(
          BaseResponse.error("Email already used")
        );
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(finalPassword, salt);
      
      // Create new user
      const newUser = await UserRepository.create(finalName, finalEmail, hashedPassword);
      
      return res.status(201).json(
        BaseResponse.success("User created", newUser)
      );
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json(
        BaseResponse.error("Error registering user")
      );
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};
      
      // Extract from query if not in body
      const emailQuery = req.query.email;
      const passwordQuery = req.query.password;
      
      const finalEmail = email || emailQuery;
      const finalPassword = password || passwordQuery;
      
      // Validate required fields
      if (!finalEmail || !finalPassword) {
        return res.status(400).json(
          BaseResponse.error("Email and password are required")
        );
      }
      
      // Check if user exists
      const user = await UserRepository.findByEmail(finalEmail);
      if (!user) {
        return res.status(401).json(
          BaseResponse.error("Invalid email or password")
        );
      }
      
      // Verify password using bcrypt compare
      const isValidPassword = await bcrypt.compare(finalPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json(
          BaseResponse.error("Invalid email or password")
        );
      }
      
      return res.status(200).json(
        BaseResponse.success("Login success", user)
      );
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json(
        BaseResponse.error("Error during login")
      );
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id, name, email, password } = req.body;
      
      // Validate required fields
      if (!id || !name || !email || !password) {
        return res.status(400).json(
          BaseResponse.error("Missing required fields")
        );
      }
      
      // Validate email format using regex
      if (!validateEmail(email)) {
        return res.status(400).json(
          BaseResponse.error("Invalid email format")
        );
      }
      
      // Validate password strength using regex
      if (!validatePassword(password)) {
        return res.status(400).json(
          BaseResponse.error("Password must be at least 8 characters with at least 1 number and 1 special character")
        );
      }
      
      // Check if user exists
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json(
          BaseResponse.error("User not found")
        );
      }
      
      // Hash password before update
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Update user with hashed password
      const updatedUser = await UserRepository.update(id, name, email, hashedPassword);
      
      return res.status(200).json(
        BaseResponse.success("User updated", updatedUser)
      );
    } catch (error) {
      console.error('Error in updateUser:', error);
      return res.status(500).json(
        BaseResponse.error("Error updating user")
      );
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json(
          BaseResponse.error("User not found")
        );
      }
      
      // Delete user
      const deletedUser = await UserRepository.delete(id);
      
      return res.status(200).json(
        BaseResponse.success("User deleted", deletedUser)
      );
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return res.status(500).json(
        BaseResponse.error("Error deleting user")
      );
    }
  }

  // Top up user balance
static async topUp(req, res) {
  try {
    // Mengambil parameter dari query string
    const id = req.query.id;
    const amountStr = req.query.amount;
    
    // Validasi parameter yang diperlukan
    if (!id) {
      return res.status(400).json(
        BaseResponse.error("User ID is required")
      );
    }
    
    if (!amountStr) {
      return res.status(400).json(
        BaseResponse.error("Amount is required")
      );
    }
    
    // Konversi jumlah ke angka dan validasi
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json(
        BaseResponse.error("Amount must be a positive number")
      );
    }
    
    // Mencari pengguna terlebih dahulu
    const user = await UserRepository.findById(id);
    if (!user) {
      return res.status(404).json(
        BaseResponse.error("User not found")
      );
    }
    
    // Menghitung saldo baru (memastikan saldo saat ini diperlakukan sebagai angka)
    const currentBalance = user.balance ? parseFloat(user.balance) : 0;
    const newBalance = currentBalance + amount;
    
    console.log(`User ${id} - Current balance: ${currentBalance}, Adding: ${amount}, New balance: ${newBalance}`);
    
    // Memperbarui saldo pengguna
    const updatedUser = await UserRepository.updateBalance(id, newBalance);
    
    if (!updatedUser) {
      return res.status(500).json(
        BaseResponse.error("Failed to update user balance")
      );
    }
    
    // Mengembalikan respons sukses
    return res.status(200).json(
      BaseResponse.success("Balance updated successfully", updatedUser)
    );
    
  } catch (error) {
    console.error("Error in topUp:", error);
    return res.status(500).json(
      BaseResponse.error("Error updating user balance")
    );
  }
}
}


module.exports = UserController;