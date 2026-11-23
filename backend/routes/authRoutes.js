
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GENERATE JWT TOKEN
// ==========================================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// ==========================================
// STUDENT REGISTRATION
// ==========================================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            studentId,
            department,
            phone
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            studentId,
            department,
            phone,
            role: "student"
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                department: user.department,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
});

// ==========================================
// USER LOGIN
// ==========================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                department: user.department,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

// ==========================================
// GET LOGGED-IN USER PROFILE
// ==========================================

router.get("/me", protect, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User authenticated successfully!",
        user: req.user
    });
});

// ==========================================
// UPDATE STUDENT PROFILE
// ==========================================

router.put(
    "/me",
    protect,
    authorizeRoles("student"),
    async (req, res) => {
        try {
            const { name, phone, hostel } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required."
                });
            }

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            user.name = name.trim();
            user.phone = phone ? phone.trim() : "";
            user.hostel = hostel ? hostel.trim() : "";

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully!",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    studentId: user.studentId,
                    department: user.department,
                    phone: user.phone,
                    hostel: user.hostel,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Student Profile Update Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update profile."
            });
        }
    }
);

// ==========================================
// ADMIN ACCESS TEST
// ==========================================

router.get(
    "/admin-test",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Admin access verified successfully!"
        });
    }
);

// ==========================================
// GET ALL REGISTERED STUDENTS (ADMIN ONLY)
// ==========================================

router.get(
    "/admin/students",
    protect,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const students = await User.find({
                role: "student"
            })
                .select("-password")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "Students fetched successfully!",
                totalStudents: students.length,
                students
            });

        } catch (error) {
            console.error("Fetch Students Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch students."
            });
        }
    }
);

// ==========================================
// UPDATE ADMIN PROFILE (ADMIN ONLY)
// ==========================================

router.put(
    "/admin/profile",
    protect,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { name, phone, department } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Admin name is required."
                });
            }

            const admin = await User.findById(req.user._id);

            if (!admin || admin.role !== "admin") {
                return res.status(404).json({
                    success: false,
                    message: "Admin account not found."
                });
            }

            admin.name = name.trim();
            admin.phone = phone ? phone.trim() : "";
            admin.department = department
                ? department.trim()
                : "";

            await admin.save();

            return res.status(200).json({
                success: true,
                message: "Admin profile updated successfully!",
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone,
                    department: admin.department,
                    role: admin.role
                }
            });

        } catch (error) {
            console.error("Admin Profile Update Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update admin profile."
            });
        }
    }
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
