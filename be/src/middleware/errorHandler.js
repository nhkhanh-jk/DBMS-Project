function errorHandler(err, req, res, next) {
  const code = err.status || err.code || 500;
  res.status(code).json({ error: err.message || 'Internal server error', code });
}

module.exports = errorHandler;
