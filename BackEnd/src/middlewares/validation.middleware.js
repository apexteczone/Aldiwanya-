const validation = (schema) => {

  return (req, res, next) => {

    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
    };

    const results = schema.validate(
      data,
      {
        abortEarly: false,
        allowUnknown: false,
      }
    );

    if (results.error) {

      const errorMessages =
        results.error.details.map(
          (obj) => obj.message
        );

      return next(
        new Error(
          errorMessages.join(", "),
          {
            cause: 422,
          }
        )
      );
    }

    return next();
  };
};

export default validation;