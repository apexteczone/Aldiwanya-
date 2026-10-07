// src/DB/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import connectDB from "./connection.js"; 
import User from "./models/User.js";
import { hash } from "../utils/hashing/hashing.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const plainPassword = process.env.ADMIN_PASSWORD ;
    const adminPhone = process.env.ADMIN_PHONE ;

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { phoneNumber: adminPhone }]
    });

    if (existingAdmin) {
      console.log("=========================================");
      console.log("Admin account already exists in DB!");
      console.log(`Identifier: ${adminEmail}`);
      console.log("=========================================");
      process.exit(0);
    }


    const passwordHash = hash({ plainText: plainPassword });

    await User.create({
      fullName: "Super Admin",
      email: adminEmail,
      phoneNumber: adminPhone,
      passwordHash: passwordHash,
      role: "Admin",
      termsAccepted: true,
      termsVersion: "v1",
    });

    console.log("=========================================");
    console.log("Admin Created Successfully from .env!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Phone: ${adminPhone}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error creating Admin seed:", error);
    process.exit(1);
  }
};

seedAdmin();