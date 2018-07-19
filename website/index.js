const express = require("express");
const app = express();


const listeningPort = 1664;


app.use("/downloads", express.static(path.join(__dirname, 'front/public')));
app.use(express.static(path.join(__dirname, 'front')));



app.get('/', (req, res) => {
  res.status(200).send("Hello world!");
});


app.post('/exercise1', (req, res) => {
  console.log("Got a POST request on '/exercise1'");

  // TODO: do some stuff here

  res.status(200).json({
    error: false,
    message: "Exercice réussi !"
  });
});


app.listen(listeningPort, () => console.log(`Listening on port ${listeningPort}`));