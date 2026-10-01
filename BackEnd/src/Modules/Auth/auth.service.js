import UserModel from "../../DB/models/User.js";
import { hash , compare} from "../../utils/hashing/hashing.js";
import PasswordResetTokenModel from "../../DB/models/PasswordResetToken.js"
import crypto from "crypto";
import {generateToken} from "../../utils/token/token.js";
import { sendPasswordResetEmail } from "../../utils/email/email.js";





// REGISTER
export const userRegister =
  async (
    req,
    res,
    next
  ) => {

    const {
      fullName,
      email,
      phoneNumber,
      password,
      termsAccepted,
    } = req.body;


    const existingEmail =
      await UserModel.findOne({
        email,
      });


    if (existingEmail) {

      return next(
        new Error(
          "Email already exists",
          {
            cause: 409,
          }
        )
      );

    }


    const existingPhone =
      await UserModel.findOne({
        phoneNumber,
      });


    if (existingPhone) {

      return next(
        new Error(
          "Phone number already exists",
          {
            cause: 409,
          }
        )
      );

    }


    const passwordHash =
      hash({
        plainText:
          password,
      });


    const user =
      await UserModel.create({

        fullName,

        email,

        phoneNumber,

        passwordHash,

        termsAccepted,

        role: "Student",

        termsVersion: "v1",

      });


    return res.status(201).json({

      success: true,

      data: {

        id:
          user._id,

        fullName:
          user.fullName,

        email:
          user.email,

        phoneNumber:
          user.phoneNumber,

        role:
          user.role,

        createdAt:
          user.createdAt,

      },

    });

  };



// LOGIN

export const userLogin =
  async (
    req,
    res,
    next
  ) => {

    const {
      identifier,
      password,
      rememberMe,
    } = req.body;


    const isEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(identifier);


    const query = isEmail
      ? {
          email:
            identifier
              .toLowerCase()
              .trim(),
        }
      : {
          phoneNumber:
            identifier.trim(),
        };


    const user =
      await UserModel
        .findOne(query)
        .select(
          "+passwordHash"
        );


    if (!user) {

      return next(
        new Error(
          "Invalid login details",
          {
            cause: 401,
          }
        )
      );

    }


    const passwordCorrect =
      compare({

        plainText:
          password,

        hash:
          user.passwordHash,

      });


    if (!passwordCorrect) {

      return next(
        new Error(
          "Invalid login details",
          {
            cause: 401,
          }
        )
      );

    }


    const accessToken =
      generateToken({

        id:
          user._id.toString(),

        role:
          user.role,

        tokenVersion:
          user.tokenVersion,

        rememberMe:
          rememberMe === true,

      });


    return res.status(200).json({

      success: true,

      data: {

        accessToken,

        tokenType:
          "Bearer",

        user: {

          id:
            user._id,

          fullName:
            user.fullName,

          email:
            user.email,

          phoneNumber:
            user.phoneNumber,

          role:
            user.role,

        },

      },

    });

  };


// LOGOUT

export const logout =
  async (
    req,
    res,
    next
  ) => {

    const user =
      await UserModel.findByIdAndUpdate(

        req.user._id,

        {
          $inc: {
            tokenVersion: 1,
          },
        },

        {
          new: true,
        }

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


    return res.status(200).json({

      success: true,

      message:
        "Logged out successfully",

    });

  };


// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword =
  async (
    req,
    res,
    next
  ) => {

    const {
      email,
    } = req.body;


    const genericMessage =
      "If the email exists, a password reset link will be sent.";


    const user =
      await UserModel.findOne({
        email,
      });


    if (!user) {

      return res.status(200).json({

        success: true,

        message:
          genericMessage,

      });

    }


    await PasswordResetTokenModel.deleteMany({

      userId:
        user._id,

      usedAt:
        null,

    });


    const rawToken =
      crypto
        .randomBytes(32)
        .toString("hex");


    const tokenHash =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");


    const expiresInMinutes =
      Number(
        process.env
          .RESET_TOKEN_EXPIRES_MINUTES ||
        30
      );


    const expiresAt =
      new Date(
        Date.now() +
        expiresInMinutes *
        60 *
        1000
      );


    await PasswordResetTokenModel.create({

      userId:
        user._id,

      tokenHash,

      expiresAt,

    });


    const resetUrl =
      `${process.env.FRONTEND_URL}` +
      `/reset-password?token=${rawToken}`;


  

  try {

  await sendPasswordResetEmail({
    email: user.email,
    fullName: user.fullName,
    resetUrl,
  });

} catch (error) {

  console.error("========== EMAIL ERROR ==========");
  console.error("message:", error.message);
  console.error("code:", error.code);
  console.error("response:", error.response);
  console.error("responseCode:", error.responseCode);
  console.error("command:", error.command);
  console.error("================================");

  return next(
    new Error(
      "Unable to send reset email",
      {
        cause: 503,
      }
    )
  );

}


    return res.status(200).json({

      success: true,

      message:
        genericMessage,

    });

  };


// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPassword =
  async (
    req,
    res,
    next
  ) => {

    const {
      token,
      newPassword,
    } = req.body;


    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");


    const resetToken =
      await PasswordResetTokenModel
        .findOneAndReplace(

          {

            tokenHash,

            usedAt:
              null,

            expiresAt: {
              $gt:
                new Date(),
            },

          },

          {

            $set: {
              usedAt:
                new Date(),
            },

          },

          {
            new: true,
          }

        );


    if (!resetToken) {

      return next(
        new Error(
          "Invalid, expired or already used reset token",
          {
            cause: 400,
          }
        )
      );

    }


    const user =
      await UserModel
        .findById(
          resetToken.userId
        )
        .select(
          "+passwordHash"
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


    user.passwordHash =
      hash({
        plainText:
          newPassword,
      });


    user.tokenVersion += 1;


    await user.save();


    return res.status(200).json({

      success: true,

      message:
        "Password reset successfully",

    });

  };