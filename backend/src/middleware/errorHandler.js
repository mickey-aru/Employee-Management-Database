// Error codes that mean "we could not talk to MySQL properly".
const DATABASE_UNAVAILABLE_CODES = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE',
];

// Used for any URL under /api that no route matched.
function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

// Express recognises a function with four arguments as the error handler.
// We log the real error on the server but only send a safe message to the browser.
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large.' });
  }

  console.error(err);

  if (DATABASE_UNAVAILABLE_CODES.includes(err.code)) {
    return res.status(503).json({
      success: false,
      message: 'The database is currently unavailable. Please try again later.',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again.',
  });
}

module.exports = { notFoundHandler, errorHandler };
