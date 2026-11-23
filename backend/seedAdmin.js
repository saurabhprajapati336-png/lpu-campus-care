
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const createAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file.");
        }

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env."
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully!");

        const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
        const password = process.env.ADMIN_PASSWORD;

        if (password.length < 8) {
            throw new Error(
                "Admin password must contain at least 8 characters."
            );
        }

        let admin = await User.findOne({ email });

        if (admin) {
            admin.name = process.env.ADMIN_NAME || "Campus Care Admin";
            admin.role = "admin";
            admin.isActive = true;

            // Existing account ka password change nahi hoga.
            await admin.save();

            console.log("Existing user assigned Admin role.");
        } else {
            admin = await User.create({
                name: process.env.ADMIN_NAME || "Campus Care Admin",
                email,
                password: password,
                role: "admin",
                isActive: true
            });

            console.log("Admin account created successfully!");
        }

        console.log("Admin Setup Completed!");

    } catch (error) {
        console.error("Admin Setup Error:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect();
        }
    }
};

createAdmin();
