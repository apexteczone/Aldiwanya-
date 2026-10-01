const globalErrorHandler =
  (error, req, res, next) => {

    console.error(error);

    const statusCode =
      error.cause || 500;

    let code =
      "INTERNAL_SERVER_ERROR";

    switch (statusCode) {

      case 400:
        code = "BAD_REQUEST";
        break;

      case 401:
        code = "UNAUTHORIZED";
        break;

      case 403:
        code = "FORBIDDEN";
        break;

      case 404:
        code = "NOT_FOUND";
        break;

      case 409:
        code = "CONFLICT";
        break;

      case 422:
        code = "VALIDATION_ERROR";
        break;

      case 503:
        code = "SERVICE_UNAVAILABLE";
        break;

    }

    return res
      .status(statusCode)
      .json({

        success: false,

        error: {
          code,

          message:
            error.message ||
            "Something went wrong",
        },

      });

  };

export default globalErrorHandler;