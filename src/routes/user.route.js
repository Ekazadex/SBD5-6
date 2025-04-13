const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller.js');

// Define routes according to the requirements
router.get('/all', UserController.getAllUsers);
router.get('/:email', UserController.getUserByEmail);
router.get('/:id', UserController.getUserById);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/topUp', UserController.topUp);
router.put('/', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;