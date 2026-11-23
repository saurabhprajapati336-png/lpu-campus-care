
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        complaintId: {
            type: String,
            unique: true,
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Electrical",
                "Plumbing",
                "Cleaning",
                "Furniture",
                "Internet",
                "Civil",
                "Other"
            ]
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending"
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        adminRemark: {
            type: String,
            default: ""
        },

        // Complaint status history
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: ["Pending", "In Progress", "Resolved"],
                    required: true
                },

                remark: {
                    type: String,
                    default: ""
                },

                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
