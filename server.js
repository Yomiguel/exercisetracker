const express = require("express");
const app = express();
const cors = require("cors");
const moongose = require("mongoose");
const { default: mongoose } = require("mongoose");
const response = require("express");
const { handle } = require("express/lib/application");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

moongose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;

const usersDataSchema = new Schema({ username: String });
const exerciseDataSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});

const User = mongoose.model("user", usersDataSchema);
const Exercise = mongoose.model("exercise", exerciseDataSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create({ username: req.body.username });
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const namePattern = /[\s\S]/;
    const allUsers = await User.find({ username: namePattern });
    const usersList = allUsers.map((user) => {
      return { username: user.username, _id: user._id };
    });
    res.send(usersList);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (req.body.date) {
      const exercise = await Exercise.create({
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: new Date(req.body.date),
      });
      res.json({
        _id: user._id,
        username: exercise.username,
        date: exercise.date.toDateString(),
        description: exercise.description,
        duration: exercise.duration,
      });
    } else {
      const exercise = await Exercise.create({
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: new Date(),
      });
      res.json({
        _id: user._id,
        username: exercise.username,
        date: exercise.date.toDateString(),
        description: exercise.description,
        duration: exercise.duration,
      });
    }
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);
  const options = { username: user.username };
  if (from) {
    options.date = { $gt: new Date(from) };
  }
  if (to) {
    options.date = { $lt: new Date(to) };
  }
  const dataExercise = await Exercise.find(options).limit(limit);
  const exerciseList = dataExercise.map((data) => {
    return {
      description: data.description,
      duration: data.duration,
      date: data.date.toDateString(),
    };
  });
  res.json({
    username: user.username,
    count: exerciseList.length,
    _id: user._id,
    log: exerciseList,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
