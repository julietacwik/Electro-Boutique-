function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.message || "Ocurrio un error interno."
  });
}

module.exports = { notFoundHandler, errorHandler };
