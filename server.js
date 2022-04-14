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
app.use(express.json());
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
const logSchema = new Schema({
  username: String,
  count: Number,
  log: Array,
});

const User = mongoose.model("user", usersDataSchema);
const Exercise = mongoose.model("exercise", exerciseDataSchema);
const Log = mongoose.model("log", logSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  new User({ username: req.body.username }).save((error) => {
    if (error) {
      return handlerError(error);
    }
  });
  const userSeeker = await User.findOne({ username: req.body.username });
  res.json({ username: userSeeker.username, _id: userSeeker["_id"] });
});

app.get("/api/users", async (req, res) => {
  const namePattern = /[\s\S]/;
  const allUsers = await User.find({ username: namePattern });
  const usersList = allUsers.map((user) => {
    return { username: user.username, _id: user["_id"] };
  });
  res.send(usersList);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userSeeker = await User.findById(req.params._id);
  if (req.body.date) {
    new Exercise({
      username: userSeeker.username,
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date),
    }).save((error) => {
      if (error) {
        return handlerError(error);
      }
    });
    res.json({
      username: userSeeker.username,
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date).toDateString(),
      _id: req.params._id,
    });
  } else {
    new Exercise({
      username: userSeeker.username,
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(),
    }).save((error) => {
      if (error) {
        return handlerError(error);
      }
    });
    const date = await Exercise.findOne({ username: userSeeker.username });
    res.json({
      username: userSeeker.username,
      description: req.body.description,
      duration: req.body.duration,
      date: date.date.toDateString(),
      _id: req.params._id,
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
