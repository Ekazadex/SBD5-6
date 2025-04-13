const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: {
        message: err.message || 'Terjadi kesalahan internal server',
        code: err.code || 'INTERNAL_SERVER_ERROR'
      }
    });
  };
  
  module.exports = errorHandler;