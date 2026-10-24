export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err.message || err)

  // Avoid leaking internal database secrets in client responses
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    error: message,
  })
}
