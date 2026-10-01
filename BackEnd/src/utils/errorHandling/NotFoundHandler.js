const notFoundHandler =
  (req, res, next) => {

    return next(
      new Error(
        `Route not found: ${req.method} ${req.originalUrl}`,
        {
          cause: 404,
        }
      )
    );

  };

export default notFoundHandler;