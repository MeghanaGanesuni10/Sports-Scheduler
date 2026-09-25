// Centralized error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Something went wrong. Please try again later.'
    : err.message;

  res.status(statusCode).render('error', {
    title: 'Error',
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : { status: statusCode }
  });
};

module.exports = { errorHandler };
