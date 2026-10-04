import asyncHandler from "../utils/errorHandling/asyncHandler.js";
import {verifyToken} from "../utils/token/token.js";
import UserModel from "../DB/models/User.js";

const authentication = () => {

  return asyncHandler(
    async (req, res, next) => {

      const {
        authorization,
      } = req.headers;


      if (!authorization) {

        return next(
          new Error(
            "Authorization required",
            {
              cause: 401,
            }
          )
        );

      }


      const [
        bearer,
        token,
      ] =
        authorization.split(" ");


      if (
        bearer !== "Bearer" ||
        !token
      ) {

        return next(
          new Error(
            "Invalid authorization format",
            {
              cause: 401,
            }
          )
        );

      }


      let decoded;

      try {

        decoded =
          verifyToken({
            token,
          });

      } catch (error) {

        return next(
          new Error(
            "Invalid or expired token",
            {
              cause: 401,
            }
          )
        );

      }


      const user =
        await UserModel.findById(
          decoded.id
        );


      if (!user) {

        return next(
          new Error(
            "User Not Found",
            {
              cause: 404,
            }
          )
        );

      }


      if (
        decoded.tokenVersion !==
        user.tokenVersion
      ) {

        return next(
          new Error(
            "Token has been revoked",
            {
              cause: 401,
            }
          )
        );

      }


      req.user = user;

      return next();

    }
  );

};


export const allowTo = (
  roles = []
) => {

  return asyncHandler(
    async (req, res, next) => {

      if (
        !roles.includes(
          req.user.role
        )
      ) {

        return next(
          new Error(
            "Forbidden",
            {
              cause: 403,
            }
          )
        );

      }

      return next();

    }
  );

};

export default authentication;