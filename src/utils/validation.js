const { body, param, validationResult } = require('express-validator');
const xss = require('xss');

// Existing email and password validators
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
};

// Clean user input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return xss(input.trim());
};

// Validation chains for different entities
const itemValidationRules = [
  body('name')
    .notEmpty().withMessage('Nama item tidak boleh kosong')
    .isLength({ min: 2, max: 100 }).withMessage('Nama item harus antara 2-100 karakter')
    .customSanitizer(sanitizeInput),
  
  body('price')
    .notEmpty().withMessage('Harga item tidak boleh kosong')
    .isInt({ min: 0 }).withMessage('Harga harus berupa angka positif')
    .toInt(),
  
  body('store_id')
    .notEmpty().withMessage('ID Toko tidak boleh kosong')
    .isUUID().withMessage('ID Toko harus berupa UUID yang valid'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok harus berupa angka positif')
    .toInt()
];

const userValidationRules = [
  body('email')
    .notEmpty().withMessage('Email tidak boleh kosong')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password tidak boleh kosong')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password harus mengandung minimal 1 angka dan 1 karakter khusus'),
  
  body('name')
    .notEmpty().withMessage('Nama tidak boleh kosong')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter')
    .customSanitizer(sanitizeInput)
];

// Middleware untuk handle validasi
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware untuk sanitasi semua input
const sanitizeAllInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  itemValidationRules,
  userValidationRules,
  validate,
  sanitizeAllInputs
};