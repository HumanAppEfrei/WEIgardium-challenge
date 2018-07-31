const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

const db = require("./config/db");
const User = require("./models/user");

const isAdmin = require("./middlewares/isAdmin");

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


app.post('/exercise1', (req, res) => {
  console.log("Got a POST request on '/exercise1'");

  // TODO: do some stuff here

  res.status(200).json({
    error: false,
    message: "Exercice réussi !"
  });
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



app.post("/user/:studentId/", async (req, res) => {
  const studentID = req.params.id;
  let user = await User.findOne({studentID: studentID});

  // If the user exists
  if (user.exists)
    return res.status(400).redirect("/");

  // Creating a user
  const data = req.body;
  user = new User(null , {
    studentID: studentID,
    first_name: data.firstName,
    last_name: data.lastName,
    done: {
      ex_1: false,
      ex_2: false,
      ex_3: false
    }
  });
  user.create();
});




// Listening or creating admins

newAdmin = false;
process.argv.forEach((val, index, array) => {
  if (val === "--create-admin") {
    newAdmin = true;
  }
});

if (newAdmin) {
  require("./config/admin").create(process.exit);
}
else {
  app.listen(listeningPort, async () => {
    db.connection = await db.connect();
    console.log(`Listening on port ${listeningPort}`);
  });
}
