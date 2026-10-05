const mongoose = require("mongoose");

// ==========================================
// HABIT SCHEMA
// ==========================================

const habitSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Habit name
    habit: {
      type: String,
      required: true,
      trim: true,
    },

    // Day of the month
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    // Selected month
    // Example: "2026-09"
    month: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}$/,
    },

    // Completion status
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// PREVENT DUPLICATES
// ==========================================
//
// Same USER + same habit + same day + same month
// can have only ONE database record.
//
// Example:
//
// User A + Study + Day 1 + 2026-09
// User B + Study + Day 1 + 2026-09
//
// These are different records.
//

habitSchema.index(
  {
    user: 1,
    habit: 1,
    day: 1,
    month: 1,
  },
  {
    unique: true,
  }
);


// ==========================================
// EXPORT MODEL
// ==========================================

module.exports = mongoose.model(
  "Habit",
  habitSchema
);