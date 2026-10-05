const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Habit = require("./models/Habit");
const Sleep = require("./models/Sleep");
const Note = require("./models/Note");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/smart_lifestyle_tracker"
  )
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error
    );
  });


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send(
    "Smart Lifestyle Tracker Backend is working!"
  );
});


// ===============================
// SAVE HABIT DATA
// ===============================

app.post("/api/habit", async (req, res) => {
  try {
    const {
      habit,
      day,
      completed
    } = req.body;

    const newHabit = new Habit({
      habit: habit,
      day: day,
      completed: completed
    });

    await newHabit.save();

    console.log(
      "Habit saved:",
      newHabit
    );

    res.json({
      success: true,
      message: "Habit saved successfully!",
      data: newHabit
    });

  } catch (error) {

    console.error(
      "Error saving habit:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save habit"
    });
  }
});


// ===============================
// GET HABIT DATA
// ===============================

app.get("/api/habits", async (req, res) => {
  try {

    const habits = await Habit.find();

    res.json({
      success: true,
      data: habits
    });

  } catch (error) {

    console.error(
      "Error getting habits:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get habits"
    });
  }
});


// ===============================
// SAVE / UPDATE / DELETE SLEEP
// ===============================

app.post("/api/sleep", async (req, res) => {

  try {

    const {
      day,
      hours
    } = req.body;


    // ===============================
    // IF "-" IS SELECTED
    // DELETE SLEEP DATA
    // ===============================

    if (
      hours === "" ||
      hours === null ||
      hours === undefined
    ) {

      await Sleep.deleteOne({
        day: day
      });

      console.log(
        `Sleep data deleted for day ${day}`
      );

      return res.json({
        success: true,
        message:
          "Sleep data removed successfully!"
      });
    }


    // ===============================
    // SAVE OR UPDATE SLEEP
    // ===============================

    const sleepData =
      await Sleep.findOneAndUpdate(
        {
          day: day
        },
        {
          hours: Number(hours)
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );


    console.log(
      "Sleep saved/updated:",
      sleepData
    );


    res.json({
      success: true,
      message:
        "Sleep data saved successfully!",
      data: sleepData
    });

  } catch (error) {

    console.error(
      "Error saving sleep:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to save sleep data"
    });
  }
});


// ===============================
// GET SLEEP DATA
// ===============================

app.get("/api/sleep", async (req, res) => {

  try {

    const sleep = await Sleep.find();

    res.json({
      success: true,
      data: sleep
    });

  } catch (error) {

    console.error(
      "Error getting sleep:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get sleep data"
    });
  }
});


// ===============================
// SAVE NOTE
// ===============================

app.post("/api/note", async (req, res) => {

  try {

    const {
      note,
      date
    } = req.body;


    const newNote = new Note({
      note: note,
      date: date
    });


    await newNote.save();


    console.log(
      "Note saved:",
      newNote
    );


    res.json({
      success: true,
      message:
        "Note saved successfully!",
      data: newNote
    });

  } catch (error) {

    console.error(
      "Error saving note:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to save note"
    });
  }
});


// ===============================
// GET NOTES
// ===============================

app.get("/api/notes", async (req, res) => {

  try {

    const notes = await Note.find();

    res.json({
      success: true,
      data: notes
    });

  } catch (error) {

    console.error(
      "Error getting notes:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get notes"
    });
  }
});


// ===============================
// EDIT NOTE
// ===============================

app.put("/api/note/:id", async (req, res) => {

  try {

    const {
      note,
      date
    } = req.body;

    const updatedNote =
      await Note.findByIdAndUpdate(
        req.params.id,
        {
          note: note,
          date: date
        },
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedNote) {

      return res.status(404).json({
        success: false,
        message: "Note not found"
      });

    }

    console.log(
      "Note updated:",
      updatedNote
    );

    res.json({
      success: true,
      message:
        "Note updated successfully!",
      data: updatedNote
    });

  } catch (error) {

    console.error(
      "Error updating note:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update note"
    });
  }
});


// ===============================
// DELETE NOTE
// ===============================

app.delete("/api/note/:id", async (req, res) => {

  try {

    const deletedNote =
      await Note.findByIdAndDelete(
        req.params.id
      );

    if (!deletedNote) {

      return res.status(404).json({
        success: false,
        message: "Note not found"
      });

    }

    console.log(
      "Note deleted:",
      deletedNote
    );

    res.json({
      success: true,
      message:
        "Note deleted successfully!",
      data: deletedNote
    });

  } catch (error) {

    console.error(
      "Error deleting note:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete note"
    });
  }
});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});