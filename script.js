let player1Name = "";
let player2Name = "";
let player1Score = 0;
let player2Score = 0;
let roundNumber = 1;
let usedCategories = [];
let questions = [];
let currentQuestionIndex = 0;

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });
  document.getElementById(screenId).classList.remove("hidden");
}

document.getElementById("startGame").addEventListener("click",function() {
  player1Name = document.getElementById("player1").value.trim();
  player2Name = document.getElementById("player2").value.trim();

  if (!player1Name || !player2Name) {
    alert("Both player names are required");
    return;
  }

  if (player1Name === player2Name) {
    alert("Player names must be unique");
    return;
  }

  loadCategories();
  showScreen("screen-category");
});

const allCategories = [
  "science",
  "history",
  "sports",
  "music",
  "geography"
];

function loadCategories() {
  document.getElementById("roundText").innerText = `Round ${roundNumber}`;

  const select = document.getElementById("categorySelect");
  select.innerHTML = "";

  const availableCategories = allCategories.filter(
    cat => !usedCategories.includes(cat)
  );

  availableCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    select.appendChild(option);
  });
}

async function fetchQuestions(category) {
  questions = [];

  const difficulties = ["easy", "medium", "hard"];

  for (let difficulty of difficulties) {
    const response = await fetch(
      `https://the-trivia-api.com/v2/questions?categories=${category}&difficulties=${difficulty}&limit=2`
    );

    const data = await response.json();
    questions.push(...data);
  }
}

document.getElementById("startRound").addEventListener("click", async function() {
  const selectedCategory = document.getElementById("categorySelect").value;

  usedCategories.push(selectedCategory);

  await fetchQuestions(selectedCategory);

  currentQuestionIndex = 0;
  showQuestion();
  showScreen("screen-gameplay");
});

function showQuestion() {
  const questionObj = questions[currentQuestionIndex];

  const currentPlayer =
    currentQuestionIndex % 2 === 0 ? player1Name : player2Name;

  document.getElementById("info").innerText =
    `Round ${roundNumber} | ${questionObj.category} | ${questionObj.difficulty.toUpperCase()} | ${currentPlayer}'s Turn`;

  document.getElementById("scores").innerText =
    `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`;

  document.getElementById("question").innerText =
    questionObj.question.text;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  const options = [
    ...questionObj.incorrectAnswers,
    questionObj.correctAnswer
  ].sort(() => Math.random() - 0.5);

  options.forEach(optionText => {
    const button = document.createElement("button");
    button.innerText = optionText;
    button.className = "option";

    button.addEventListener("click", function(){
      checkAnswer(button, questionObj.correctAnswer, questionObj.difficulty)
    });

    optionsDiv.appendChild(button);
  });

  document.getElementById("nextBtn").disabled = true;
}

function checkAnswer(selectedButton, correctAnswer, difficulty) {
  const allButtons = document.querySelectorAll(".option");
  allButtons.forEach(btn => btn.disabled = true);

  if (selectedButton.innerText === correctAnswer) {
    selectedButton.style.backgroundColor = "lightgreen";

    let points = 0;
    if (difficulty === "easy") points = 10;
    else if (difficulty === "medium") points = 15;
    else if (difficulty === "hard") points = 20;

    if (currentQuestionIndex % 2 === 0) {
      player1Score += points;
    } else {
      player2Score += points;
    }
  } else {
    selectedButton.style.backgroundColor = "salmon";
  }

  document.getElementById("nextBtn").disabled = false;
}

document.getElementById("nextBtn").addEventListener("click",function(){
  currentQuestionIndex++;

  if (currentQuestionIndex < 6) {
    showQuestion();
  } else {
    showScreen("screen-summary");
  }
});

document.getElementById("nextRound").addEventListener("click",function(){
  roundNumber++;
  loadCategories();
  showScreen("screen-category");
});

document.getElementById("endGame").addEventListener("click", function() {
  showFinalResult();
});

function showFinalResult() {
  document.getElementById("finalScores").innerText =
    `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`;
  let resultText = "";
  if (player1Score > player2Score) {
    resultText = `${player1Name} Wins!`;
  } else if (player2Score > player1Score) {
    resultText = `${player2Name} Wins!`;
  } else {
    resultText = "It's a Draw!";
  }
  document.getElementById("winner").innerText = resultText;
  showScreen("screen-result");
}
