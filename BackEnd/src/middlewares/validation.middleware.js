import asyncHandler from "../utils/errorHandling/asyncHandler.js";



const validation = (
  schema,
  source = "body"
) => {

  return asyncHandler(
    async (req, res, next) => {

      const { error } =
        schema.validate(
          req[source],
          {
            abortEarly: false,
            allowUnknown: false,
          }
        );

      if (error) {

        return next(
          new Error(
            error.details
              .map(
                (item) => item.message
              )
              .join(", "),
            {
              cause: 422,
            }
          )
        );

      }

      return next();

    }
  );
};



export default validation;