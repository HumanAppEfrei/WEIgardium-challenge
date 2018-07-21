const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

const db = require("./services/db");

const listeningPort = 1664;


app.use(bodyParser.json({type: 'application/*+json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({type: 'text/html'}));

app.use("/downloads", express.static(path.join(__dirname, 'front/public')));
app.use(express.static(path.join(__dirname, 'front')));



app.get('/', (req, res) => {
  console.log("User connected");
  res.status(200).render("front/index.html");
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



app.listen(listeningPort, async () => {
  await db.connect();
  console.log(`Listening on port ${listeningPort}`);
  users = await db.selectAll("User");
  console.log(users);
});