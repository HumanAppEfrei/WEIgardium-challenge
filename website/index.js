const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const favicon = require("serve-favicon");
const cors = require("cors");

const db = require("./config/db");
const User = require("./models/user");

const isAdmin = require("./middlewares/isAdmin");

const FancyLogger = require("simple-fancy-log");
createTags = () => {
  FancyLogger.createTag({name: "listening", content: "Listening", color: "yellow"});
  FancyLogger.createTag({name: "user-creation", content: "User creation", color: "green"});
  FancyLogger.createTag({name: "user-creation-success", content: "User created", color: "green"})
  FancyLogger.createTag({name: "error", content: "ERROR", color: "red"});
  FancyLogger.createTag({name: "warning", content: "Warning", color: "yellow", bgColor: "red"});
  FancyLogger.createTag({name: "update", content: "User update", color: "cyan"});
  FancyLogger.createTag({name: "exercise", content: "Exercise", color: "blue"});
  FancyLogger.createTag({name: "exercise-success", content: "Exercise Success", color: "white", bgColor: "green"});
  FancyLogger.createTag({name: "post", content: "POST request"});
  FancyLogger.createTag({name: "user-update", content: "User update", color: "yellow"});
  FancyLogger.createTag({name: "user-update-ex1", content: "Ex 1", color: "yellow"});
  FancyLogger.createTag({name: "user-update-ex2", content: "Ex 2", color: "yellow"});
  FancyLogger.createTag({name: "user-update-ex3", content: "Ex 3", color: "yellow"});
  FancyLogger.createTag({name: "admin", content: "Admin", color: "yellow"});
  FancyLogger.createTag({name: "admin-creation", content: "Admin Creation", color: "yellow"});
};
createTags();
const logger = new FancyLogger();



const listeningPort = 1664;

app.use(bodyParser.json("application/*+json"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text('text/html'));

app.use("/downloads", express.static(path.join(__dirname, 'front/public')));

app.use("/js", express.static(path.join(__dirname, 'front/js')));
app.use("/css", express.static(path.join(__dirname, "front/css")));
app.use("/public", express.static(path.join(__dirname, "front/public")));

app.use(favicon(path.join(__dirname, "front", "public", "logo.png")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'front'));


app.use(cors());

app.get('/', (req, res) => {
  return res.status(200).render("index");
});


app.get("/register", (req, res) => {
  return res.status(200).render("register");
});


app.get("/all-users", async (req, res) => {
  let users = await User.getAll();

  return res.status(200).render("all-users", {users: users});
});


app.get("/submit", (req, res) => {
  return res.status(200).render("submit");
});


app.post("/user", async (req, res) => {
  const data = req.body;
  let studentID = data.studentID;
  const firstName = data.firstName;
  const lastName = data.lastName;

  studentID = studentID.trim();
  if (!studentID.startsWith("20180") || studentID.length !== 8) {
    logger.addTags("post", "warning", "error", "user-creation");
    logger.log("Attempt to create account for user #" + studentID + " but this studentID does not match the parameters set");
    return res.status(403).json({
      error: true,
      message: "Essayer de bourriner notre site, c'est mal, le faites pas"
    });
  }

  if (!(data.hasOwnProperty("studentID") && data.hasOwnProperty("firstName") && data.hasOwnProperty("lastName"))) {
    logger.addTags("post", "warning", "error", "user-creation");
    logger.log("Passed request does not meet the minimal requirements");
    return res.status(400).redirect("/");
  }

  let user = await User.findOne({studentID: studentID});

  // If the user exists
  if (user.exists) {
    logger.addTags("post", "warning");
    logger.log("POST request on already existing user");
    return res.status(403).redirect("/");
  }

  // Creating a user
  user = new User(null, {
    studentID: studentID,
    firstName: firstName,
    lastName: lastName,
    done: {
      ex_1: false,
      ex_2: false,
      ex_3: false
    }
  });
  await user.create(req, res);
});


app.post("/submit", async (req, res) => {
  let user = await User.findOne({studentID: req.body.studentID});

  if (user.row === undefined)
    return res.status(404).json({error: true, message: "Utilisateur non trouvé (numéro d'étudiant " + req.body.studentID + ")"});

  if (user.firstName !== req.body.firstName || user.lastName !== req.body.lastName)
    return res.status(401).json({error: true, message: "Erreur d'authentification"});

  switch (req.body.exercise) {
    case 1:
      if (req.body.answer === "answer") {
        logger.addTags("user-update", "user-update-ex1");
        logger.log("Updating user " + user.fullName + " (studentID: " + user.studentID + ")");
        await User.update({studentID: req.body.studentID}, {ex1: true, ex2: user.done.ex2, ex3: user.done.ex3}, up => {
          if (up.error)
            res.status(400).json(up);
          res.status(200).json(up);
        });
        return;
      }
      break;

    case 2:
      if (req.body.answer === "answer") {
        logger.addTags("user-update", "user-update-ex2");
        logger.log("Updating user " + user.fullName + " (studentID: " + user.studentID + ")");
        await User.update({studentID: req.body.studentID}, {ex1: user.done.ex1, ex2: true, ex3: user.done.ex3}, up => {
          if (up.error)
            return res.status(400).json(up);
          return res.status(200).json(up);
        });
      }
      break;

    case 3:
      if (req.body.answer === "answer") {
        logger.addTags("user-update", "user-update-ex3");
        logger.log("Updating user " + user.fullName + " (studentID: " + user.studentID + ")");
        await User.update({studentID: req.body.studentID}, {ex1: user.done.ex1, ex2: user.done.ex2, ex3: true}, up => {
          if (up.error)
            return res.status(400).json(up);
          return res.status(200).json(up);
        });
      }
      break;

    default:
      return res.status(400).json({error: true, message: "T'es un petit malin, toi ;)"});
  }
});


app.use((req, res, next) => {
  return res.status(404).redirect("/");
});



// Listening or creating admins

let newAdmin = false;
process.argv.forEach((val, index, array) => {
  if (val === "--create-admin") {
    logger.addTags("admin", "admin-creation");
    logger.log("Creating an admin");
    newAdmin = true;
  }
});

if (newAdmin) {
  require("./config/admin").create(process.exit);
}
else {
  app.listen(listeningPort, async () => {
    db.connection = await db.connect();

    logger.addTag("listening");
    logger.log(`Listening on port ${listeningPort}`);
  });
}
