const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

const db = require("./config/db");
const User = require("./models/user");

const isAdmin = require("./middlewares/isAdmin");

const FancyLogger = require("simple-fancy-log");
FancyLogger.createTag({name: "listening", content: "Listening", color: "yellow"});
FancyLogger.createTag({name: "user-creation", content: "User creation", color: "green"});
FancyLogger.createTag({name: "user-creation-success", content: "User created", color: "green"})
FancyLogger.createTag({name: "error", content: "ERROR", color: "red"});
FancyLogger.createTag({name: "warning", content: "Warning", color: "yellow", bgColor: "red"});
FancyLogger.createTag({name: "update", content: "User update", color: "cyan"});
FancyLogger.createTag({name: "exercise", content: "Exercise", color: "blue"});
FancyLogger.createTag({name: "exercise-success", content: "Exercise Success", color: "white", bgColor: "green"});
FancyLogger.createTag({name: "post", content: "POST request"});
FancyLogger.createTag({name: "put", content: "PUT request"});
FancyLogger.createTag({name: "admin", content: "Admin", color: "yellow"});
FancyLogger.createTag({name: "admin-creation", content: "Admin Creation", color: "yellow"});
const logger = new FancyLogger();



const listeningPort = 1664;


app.use(bodyParser.json({type: 'application/*+json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({type: 'text/html'}));

app.use("/downloads", express.static(path.join(__dirname, 'front/public')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'front'));



app.get('/', (req, res) => {
  res.status(200).render("index.ejs", {message: "Camille"});
});




/*app.all("/admin", isAdmin);
app.post("/admin", (req, res) => {
  // TODO: This is only temporary security, need to be enhanced later on

    // If authenticated
    if (req.body.name === "admin" && req.body.password === "admin") {
      res.status(200).json({
        error: false,
        code: 'S_SUCCESS',
        message: 'Bienvenue'
      });
    }

    // If not authenticated
    else {
      res.status(403).json({
        error: true,
        code: 'E_NOT_ALLOWED',
        message: 'Access forbidden'
      });
  }
});*/



app.post("/user", async (req, res) => {
  const data = req.body;
  const studentID = data.studentID;
  const firstName = data.firstName;
  const lastName = data.lastName;

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
    return res.status(400).redirect("/");
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


app.put("/user", async (req, res) => {
  const data = req.body;
  const studentID = data.studentID;
  let user = await User.findOne({studentID: studentID});

  if (!user.exists) {
    logger.addTags("put", "warning");
    logger.log("PUT request on non existing user");
    return res.status(404).redirect("/");
  }

  await User.update({studentID: studentID}, {
    ex1: data.ex1,
    ex2: data.ex2,
    ex3: data.ex3
  });
});




// Listening or creating admins

newAdmin = false;
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
