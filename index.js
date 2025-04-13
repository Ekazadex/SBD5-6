const express = require('express');
const configureCors = require('./src/utils/cors.middleware.js');
const transactionRoutes = require('./src/routes/transaction.routes.js');
const itemRoutes = require('./src/routes/item.routes.js');
require('dotenv').config();


// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware
app.use(configureCors);

// Create basic routes to test server connection
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Import and use routes - notice the added .js extension
const userRoutes = require('./src/routes/user.route.js');
const storeRoutes = require('./src/routes/store.route.js');

app.use('/user', userRoutes);
app.use('/transaction', transactionRoutes);
app.use('/store', storeRoutes);
app.use('/item', itemRoutes);
app.use('/transaction', transactionRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});
