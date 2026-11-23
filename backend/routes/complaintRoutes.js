
const express = require("express");

const Complaint = require("../models/Complaint");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE NEW COMPLAINT
router.post("/", protect, authorizeRoles("student"), async (req, res) => {
    try {
        const {
            title,
            category,
            priority,
            location,
            description
        } = req.body;

        if (!title || !category || !location || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required complaint fields."
            });
        }

        const complaint = await Complaint.create({
            complaintId: "CC-" + Date.now(),
            title,
            category,
            priority: priority || "Medium",
            location,
            description,
            student: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully!",
            complaint
        });

    } catch (error) {
        console.error("Create Complaint Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit complaint."
        });
    }
});

// GET STUDENT'S COMPLAINTS
router.get("/my", protect, authorizeRoles("student"), async (req, res) => {
    try {
        const complaints = await Complaint.find({
            student: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error("Get My Complaints Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your complaints."
        });
    }
});

// GET ALL COMPLAINTS FOR ADMIN
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("student", "name email studentId department")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error("Get All Complaints Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch complaints."
        });
    }
});

// UPDATE COMPLAINT STATUS BY ADMIN
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { status, adminRemark } = req.body;

            const allowedStatuses = [
                "Pending",
                "In Progress",
                "Resolved"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid complaint status."
                });
            }

            const complaint = await Complaint.findById(req.params.id);

            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: "Complaint not found."
                });
            }

            complaint.status = status;

            if (adminRemark !== undefined) {
                complaint.adminRemark = adminRemark;
            }

            await complaint.save();

            return res.status(200).json({
                success: true,
                message: "Complaint status updated successfully!",
                complaint
            });

        } catch (error) {
            console.error("Update Complaint Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update complaint status."
            });
        }
    }
);

module.exports = router;
