const mongoose = require("mongoose");

// ==========================================
// SLEEP SCHEMA
// ==========================================

const sleepSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    // Sleep hours
    hours: {
      type: Number,
      required: true,
      min: 5,
      max: 9,
    },
  },

  {
    timestamps: true,
  }
);


// ==========================================
// PREVENT DUPLICATE SLEEP RECORDS
// ==========================================
//
// Same USER + same day + same month
// can have only ONE record.
//
// Example:
//
// User A + Day 1 + 2026-09
// User B + Day 1 + 2026-09
//
// These are different records.
//

sleepSchema.index(
  {
    user: 1,
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
  "Sleep",
  sleepSchema
);