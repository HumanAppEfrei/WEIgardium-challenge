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
  res.status(200).render("index.ejs");
});


app.post('/exercise1', (req, res) => {
  console.log("Got a POST request on '/exercise1'");

  // TODO: do some stuff here

  res.status(200).json({
    error: false,
    message: "Exercice réussi !"
  });
});



app.all("/admin", (req, res, next) => {
  if (req.body) {
    console.log(req.body);
    next();
  }
  else {
    console.log("Empty req.body");
    res.status(403).json({
      error: true,
      code: 'E_NOT_ALLOWED',
      message: 'Access forbidden'
    });
  }
});


/** Admin panel
 */
app.all("/admin", isAdmin);
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
});


//app.all("/user/:id", isAdmin);
app.get("/user/:id", async (req, res) => {
  let userID = req.params.id;
  let user = await User.findOne({id: userID});

  if (!user.exists)
    return res.status(404).json({
      error: true,
      code: 'E_NOT_FOUND',
      message: 'User with id ' + userID + ' not found'
    });

  return res.status(200).json({
    error: false,
    code: 'S_SUCCESS',
    user
  });
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
