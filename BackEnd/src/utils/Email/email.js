import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter =
  nodemailer.createTransport({

    host:
      process.env.SMTP_HOST,

    port:
      Number(
        process.env.SMTP_PORT || 587
      ),

    secure:
      process.env.SMTP_SECURE === "true",

    auth: {

      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,

    },

  });


export const sendPasswordResetEmail =
  async ({
    email,
    fullName,
    resetUrl,
  }) => {

    await transporter.sendMail({

      from:
        process.env.MAIL_FROM,

      to:
        email,

      subject:
        "Diwaniya - Reset Password",

      text: `
Hello ${fullName},

You requested to reset your password.

Reset your password here:

${resetUrl}

This link expires in ${
        process.env.RESET_TOKEN_EXPIRES_MINUTES ||
        30
      } minutes.

If you did not request this,
please ignore this email.
      `,

      html: `
<div>

  <h2>Diwaniya Password Reset</h2>

  <p>
    Hello ${fullName},
  </p>

  <p>
    You requested to reset your password.
  </p>

  <p>
    <a href="${resetUrl}">
      Reset your password
    </a>
  </p>

  <p>
    This link expires in ${
      process.env.RESET_TOKEN_EXPIRES_MINUTES ||
      30
    } minutes.
  </p>

  <p>
    If you did not request this,
    please ignore this email.
  </p>

</div>
      `,

    });

  };