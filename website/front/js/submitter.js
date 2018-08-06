const fNameInput = document.getElementById("firstname-input");
const lNameInput = document.getElementById("lastname-input");
const answerInput = document.getElementById("answer-area");
const studentIDInput = document.getElementById("student-id-input");
const exerciseInput = document.querySelector('select[name="exercise-select"]');
const submitButton = document.getElementById("submit-button");

let toSubmit = -1;
let studentID = -1;
let firstName = "";
let lastName = "";
let answer = "";

const nameRegex = /^[a-zA-ZÉéÈèâÂêÊûÛîÎôÔäÄëËûÜïÏöÖÑñ\ \-]+$/;
const studentIDRegex = /^20180[0-9]{3}$/;

document.addEventListener("DOMContentLoaded", () => {


  exerciseInput.onchange = exerciseSelectChange;
  fNameInput.onchange = fNameCheck;
  lNameInput.onchange = lNameCheck;
  studentIDInput.onchange = studentIDCheck;
  submitButton.onclick = sendAnswer;
});

const exerciseSelectChange = e => {
  if (e.target.value)
    toSubmit = parseInt(e.target.value, 10);
};


const nameCheck = (e, input) => {
  if (input === "first-name")
    firstName = nameRegex.test(e.target.value) ? e.target.value : firstName;
  else if (input === "last-name")
    lastName = nameRegex.test(e.target.value) ? e.target.value : lastName;
};
const fNameCheck = e => nameCheck(e, "first-name");
const lNameCheck = e => nameCheck(e, "last-name");

const studentIDCheck = e => studentID = studentIDRegex.test(e.target.value) ? e.target.value : studentID;


const sendAnswer = e => {
  let ok = true;

  e.preventDefault();

  if (!nameRegex.test(firstName)) {
    ok = false;
    M.toast({html: "Prénom invalide", displayLength: 1000});
  }

  if (!nameRegex.test(lastName)) {
    ok = false;
    M.toast({html: "Nom invalide", displayLength: 1000});
  }

  if (!studentIDRegex.test(studentID)) {
    ok = false;
    M.toast({html: "Numéro d'étudiant invalide", displayLength: 1000});
  }

  if (answerInput.value.trim() === "") {
    ok = false;
    M.toast({html: "Réponse invalide", displayLength: 1000});
  }

  if (toSubmit !== 1 && toSubmit !== 2 && toSubmit !== 3) {
    ok = false;
    M.toast({html: "Choisissez un exercice auquel répondre", displayLength: 1000});
  }

  if (!ok)
    return;

  axios({
    method: "post",
    url: "/submit",
    headers: {"Content-Type": "application/json;charset=utf-8"},
    data: {
      exercise: toSubmit,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studentID: studentID,
      answer: answerInput.value.trim()
    }
  })
    .then (res => {
      if (res.data.error) {
        M.toast({html: `<h5>Erreur: ${res.data.message}</h5>`, displayLength: 8000});
      } else {
        M.toast({html: `<h5>Succès: ${res.data.message}</h5>`});
      }
    })
    .catch (err => {
      if (err.response) {
        M.toast({html: `<h5>Erreur: ${err.response.data.message}</h5>`, displayLength: 8000});
      } else {
        console.error(err);
      }
    });
};