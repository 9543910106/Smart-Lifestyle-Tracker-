require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const Habit = require("./models/Habit");
const Sleep = require("./models/Sleep");
const Note = require("./models/Note");
const User = require("./models/User");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_lifestyle_tracker"
  )
  .then(() => {
    console.log("====================================");
    console.log("MongoDB connected successfully!");
    console.log("====================================");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error);
  });


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "Smart Lifestyle Tracker Backend is working!"
  );
});


// ==========================================
// MONTH VALIDATION FUNCTION
// ==========================================

function isValidMonth(month) {
  return /^\d{4}-\d{2}$/.test(month);
}


// ==========================================
// AUTHENTICATION
// REGISTER
// ==========================================

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const name =
        String(req.body.name || "").trim();

      const email =
        String(req.body.email || "")
          .trim()
          .toLowerCase();

      const password =
        String(req.body.password || "");

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      const existingUser =
        await User.findOne({
          email: email,
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const newUser =
        new User({
          name: name,
          email: email,
          password: hashedPassword,
        });

      const savedUser =
        await newUser.save();

      const token =
        jwt.sign(
          {
            userId: savedUser._id,
            email: savedUser.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

      console.log(
        "New user registered:",
        savedUser.email
      );

      res.status(201).json({
        success: true,
        message:
          "Registration successful!",
        token: token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
        },
      });

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to register user",
      });
    }
  }
);


// ==========================================
// AUTHENTICATION
// LOGIN
// ==========================================

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const email =
        String(req.body.email || "")
          .trim()
          .toLowerCase();

      const password =
        String(req.body.password || "");

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const user =
        await User.findOne({
          email: email,
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const token =
        jwt.sign(
          {
            userId: user._id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

      console.log(
        "User logged in:",
        user.email
      );

      res.json({
        success: true,
        message: "Login successful!",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to login",
      });
    }
  }
);


// ==========================================
// AUTHENTICATION
// GOOGLE LOGIN
// ==========================================

app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user without a standard password (or a random strong one)
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });

      await user.save();
      console.log("New user registered via Google:", email);
    } else {
      console.log("User logged in via Google:", email);
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Google login successful!",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to authenticate with Google",
    });
  }
});


// ==========================================
// AUTHENTICATION
// CHANGE PASSWORD
// ==========================================

app.put(
  "/api/auth/change-password",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const currentPassword =
        String(
          req.body.currentPassword || ""
        );

      const newPassword =
        String(
          req.body.newPassword || ""
        );

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Current password is required",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters",
        });
      }

      if (
        currentPassword === newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from current password",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      await user.save();

      console.log(
        "Password changed for user:",
        user.email
      );

      return res.json({
        success: true,
        message:
          "Password changed successfully!",
      });

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to change password",
      });
    }
  }
);


// ==========================================
// HABIT
// SAVE WHEN CHECKED
// DELETE WHEN UNCHECKED
// ==========================================

app.post(
  "/api/habit",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const habit =
        String(req.body.habit || "").trim();

      const day =
        Number(req.body.day);

      const month =
        String(req.body.month || "").trim();

      const completed =
        Boolean(req.body.completed);

      if (!habit) {
        return res.status(400).json({
          success: false,
          message: "Habit name is required",
        });
      }

      if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid day",
        });
      }

      if (!isValidMonth(month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month",
        });
      }

      // ==========================================
      // UNCHECK HABIT
      // ==========================================

      if (completed === false) {
        const deletedHabits =
          await Habit.deleteMany({
            user: userId,
            habit: habit,
            day: day,
            month: month,
          });

        console.log(
          "Habit unchecked:",
          habit,
          "Day:",
          day,
          "Month:",
          month
        );

        console.log(
          "Documents deleted:",
          deletedHabits.deletedCount
        );

        return res.json({
          success: true,
          action: "deleted",
          message:
            "Habit removed successfully!",
        });
      }

      // ==========================================
      // CHECK HABIT
      // ==========================================

      const savedHabit =
        await Habit.findOneAndUpdate(
          {
            user: userId,
            habit: habit,
            day: day,
            month: month,
          },
          {
            $set: {
              user: userId,
              habit: habit,
              day: day,
              month: month,
              completed: true,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      console.log(
        "Habit checked:",
        habit,
        "Day:",
        day,
        "Month:",
        month
      );

      res.json({
        success: true,
        action: "saved",
        message:
          "Habit saved successfully!",
        data: savedHabit,
      });

    } catch (error) {
      console.error(
        "Habit operation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update habit",
      });
    }
  }
);


// ==========================================
// HABIT
// GET HABITS FOR SELECTED MONTH
// ==========================================

app.get(
  "/api/habits",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const month =
        String(req.query.month || "").trim();

      if (!isValidMonth(month)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid month is required",
        });
      }

      const habits =
        await Habit.find({
          user: userId,
          month: month,
          completed: true,
        }).sort({
          day: 1,
        });

      res.json({
        success: true,
        data: habits,
      });

    } catch (error) {
      console.error(
        "Get habits error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get habits",
      });
    }
  }
);


// ==========================================
// HABIT
// DELETE SPECIFIC HABIT
// ==========================================

app.delete(
  "/api/habit/:habit/:day/:month",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const habit =
        decodeURIComponent(
          req.params.habit
        );

      const day =
        Number(req.params.day);

      const month =
        String(req.params.month);

      await Habit.deleteMany({
        user: userId,
        habit: habit,
        day: day,
        month: month,
      });

      console.log(
        "Habit deleted:",
        habit,
        "Day:",
        day,
        "Month:",
        month
      );

      res.json({
        success: true,
        message:
          "Habit deleted successfully!",
      });

    } catch (error) {
      console.error(
        "Delete habit error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete habit",
      });
    }
  }
);


// ==========================================
// SLEEP
// SAVE / UPDATE / DELETE
// ==========================================

app.post(
  "/api/sleep",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const day =
        Number(req.body.day);

      const month =
        String(req.body.month || "").trim();

      const hours =
        req.body.hours;

      if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid day",
        });
      }

      if (!isValidMonth(month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month",
        });
      }

      // ==========================================
      // DELETE SLEEP
      // ==========================================

      if (
        hours === null ||
        hours === "" ||
        hours === undefined
      ) {
        await Sleep.findOneAndDelete({
          user: userId,
          day: day,
          month: month,
        });

        console.log(
          "Sleep removed:",
          day,
          month
        );

        return res.json({
          success: true,
          action: "deleted",
          message:
            "Sleep data removed successfully!",
        });
      }

      const sleepHours =
        Number(hours);

      if (
        !Number.isFinite(sleepHours) ||
        sleepHours < 5 ||
        sleepHours > 9
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Sleep hours must be between 5 and 9",
        });
      }

      const savedSleep =
        await Sleep.findOneAndUpdate(
          {
            user: userId,
            day: day,
            month: month,
          },
          {
            $set: {
              user: userId,
              day: day,
              month: month,
              hours: sleepHours,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      console.log(
        "Sleep saved:",
        day,
        sleepHours,
        month
      );

      res.json({
        success: true,
        action: "saved",
        message:
          "Sleep saved successfully!",
        data: savedSleep,
      });

    } catch (error) {
      console.error(
        "Sleep operation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update sleep",
      });
    }
  }
);


// ==========================================
// SLEEP
// GET SELECTED MONTH
// ==========================================

app.get(
  "/api/sleep",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const month =
        String(req.query.month || "").trim();

      if (!isValidMonth(month)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid month is required",
        });
      }

      const sleep =
        await Sleep.find({
          user: userId,
          month: month,
        }).sort({
          day: 1,
        });

      res.json({
        success: true,
        data: sleep,
      });

    } catch (error) {
      console.error(
        "Get sleep error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get sleep data",
      });
    }
  }
);


// ==========================================
// SLEEP
// DELETE SPECIFIC DAY + MONTH
// ==========================================

app.delete(
  "/api/sleep/:day/:month",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const day =
        Number(req.params.day);

      const month =
        String(req.params.month);

      await Sleep.findOneAndDelete({
        user: userId,
        day: day,
        month: month,
      });

      console.log(
        "Sleep deleted:",
        day,
        month
      );

      res.json({
        success: true,
        message:
          "Sleep deleted successfully!",
      });

    } catch (error) {
      console.error(
        "Delete sleep error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete sleep",
      });
    }
  }
);


// ==========================================
// NOTES
// SAVE
// ==========================================

app.post(
  "/api/note",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const note =
        String(
          req.body.note || ""
        ).trim();

      const date =
        req.body.date;

      if (!note) {
        return res.status(400).json({
          success: false,
          message:
            "Note cannot be empty",
        });
      }

      const newNote =
        new Note({
          user: userId,
          note: note,
          date: date,
        });

      const savedNote =
        await newNote.save();

      console.log(
        "Note saved for user:",
        userId
      );

      res.json({
        success: true,
        message:
          "Note saved successfully!",
        data: savedNote,
      });

    } catch (error) {
      console.error(
        "Note error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to save note",
      });
    }
  }
);


// ==========================================
// NOTES
// GET
// ==========================================

app.get(
  "/api/notes",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const notes =
        await Note.find({
          user: userId,
        }).sort({
          _id: -1,
        });

      res.json({
        success: true,
        data: notes,
      });

    } catch (error) {
      console.error(
        "Get notes error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get notes",
      });
    }
  }
);


// ==========================================
// NOTES
// UPDATE
// ==========================================

app.put(
  "/api/note/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const note =
        String(
          req.body.note || ""
        ).trim();

      const date =
        req.body.date;

      if (!note) {
        return res.status(400).json({
          success: false,
          message:
            "Note cannot be empty",
        });
      }

      const updatedNote =
        await Note.findOneAndUpdate(
          {
            _id: req.params.id,
            user: userId,
          },
          {
            $set: {
              note: note,
              date: date,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          message:
            "Note not found",
        });
      }

      console.log(
        "Note updated for user:",
        userId
      );

      res.json({
        success: true,
        message:
          "Note updated successfully!",
        data: updatedNote,
      });

    } catch (error) {
      console.error(
        "Update note error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update note",
      });
    }
  }
);


// ==========================================
// NOTES
// DELETE
// ==========================================

app.delete(
  "/api/note/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const deletedNote =
        await Note.findOneAndDelete({
          _id: req.params.id,
          user: userId,
        });

      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          message:
            "Note not found",
        });
      }

      console.log(
        "Note deleted for user:",
        userId
      );

      res.json({
        success: true,
        message:
          "Note deleted successfully!",
        data: deletedNote,
      });

    } catch (error) {
      console.error(
        "Delete note error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete note",
      });
    }
  }
);


// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log("");
  console.log(
    "===================================="
  );
  console.log(
    " Smart Lifestyle Tracker Backend"
  );
  console.log(
    "===================================="
  );
  console.log(
    ` Server running on http://localhost:${PORT}`
  );
  console.log(
    "===================================="
  );
  console.log("");
});