// Handle unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Handle application errors
const errorHandler = (err, req, res, next) => {
  console.error("\n========== BACKEND ERROR ==========");
  console.error("Message:", err.message);
  console.error("Name:", err.name);
  console.error("Stack:", err.stack);
  console.error("===================================\n");

  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export {
  notFound,
  errorHandler
};