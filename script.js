/*
  EINSTELLUNGEN
  -------------
  START_DATE: Datum, seit dem gezählt wird (YYYY-MM-DD).
  EXPIRES_AFTER_DAYS: Nach dieser Anzahl Tagen wird die Seite ausgeblendet.
  Für "maximal 1 Jahr" stehen hier 365 Tage.
*/
const START_DATE = "2026-09-26";
const EXPIRES_AFTER_DAYS = 365;

const start = new Date(`${START_DATE}T00:00:00`);
const now = new Date();

const expiry = new Date(start);
expiry.setDate(expiry.getDate() + EXPIRES_AFTER_DAYS);

if (now >= expiry) {
  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:30px;
      font-family:system-ui;text-align:center;background:linear-gradient(135deg,#ffd6e7,#b9ecff)">
      <div>
        <div style="font-size:70px">🎂</div>
        <h1>Diese Geburtstagsseite ist abgelaufen.</h1>
        <p>Die Seite war für maximal ein Jahr vorgesehen. 💛</p>
      </div>
    </main>`;
} else {
  const daysNode = document.getElementById("days");
  const hoursNode = document.getElementById("hours");
  const minutesNode = document.getElementById("minutes");
  const secondsNode = document.getElementById("seconds");
  const sinceTextNode = document.getElementById("sinceText");
  const messageNode = document.getElementById("message");
  const surpriseButton = document.getElementById("surpriseBtn");
  const surveyPanel = document.getElementById("surveyPanel");
  const surveyQuestion = document.getElementById("surveyQuestion");
  const surveyOptions = document.getElementById("surveyOptions");
  const submitSurveyButton = document.getElementById("submitSurvey");
  const surveyBackButton = document.getElementById("surveyBack");
  const cloud1 = document.querySelector(".cloud1");
  const cloud2 = document.querySelector(".cloud2");

  const pad = (value) => String(value).padStart(2, "0");

  const updateWeather = () => {
    const diffMs = Math.max(0, Date.now() - start.getTime());
    const totalDays = Math.floor(diffMs / 86400000);

    if (totalDays >= 180) {
      cloud1.classList.add("rain-heavy");
      cloud2.classList.add("rain-heavy");
      cloud1.textContent = "☁️☁️";
      cloud2.textContent = "☁️☁️";
      return;
    }

    if (totalDays >= 90) {
      cloud1.classList.add("soon");
      cloud2.classList.add("soon");
      cloud1.textContent = "☁️";
      cloud2.textContent = "☁️";
      return;
    }

    cloud1.classList.remove("soon", "rain-heavy");
    cloud2.classList.remove("soon", "rain-heavy");
    cloud1.textContent = "";
    cloud2.textContent = "";
  };

  const updateTimer = () => {
    const diffMs = Math.max(0, Date.now() - start.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysNode.textContent = new Intl.NumberFormat("de-DE").format(days);
    hoursNode.textContent = pad(hours);
    minutesNode.textContent = pad(minutes);
    secondsNode.textContent = pad(seconds);

    sinceTextNode.textContent = `Seit dem ${start.toLocaleDateString("de-DE")}, 00:00:00 Uhr – und die Zeit läuft.`;
    updateWeather();
  };

  updateTimer();
  setInterval(updateTimer, 1000);

  const surveySteps = {
    first: {
      question: "Frage 1: Welches Geschenk?",
      options: ["Steam Gutschein für mehr Flugzeuge", "Essen gehen mit Lisa und Mirco", "Beides"],
      nextLabel: "Weiter"
    },
    steam: {
      question: "Sicher?",
      options: ["Ja, sicher", "Nein, lieber etwas anderes"],
      nextLabel: "Fertig"
    },
    essen: {
      question: "Frage 2: Welche Termine passen dir?",
      options: ["Samstag Abend", "Sonntag Nachmittag"],
      nextLabel: "Weiter"
    },
    essenChoice: {
      question: "Frage 3: Sollst du selbst wählen oder sollen wir auswählen?",
      options: ["Ich wähle selbst", "Ihr/ich wählt für uns aus"],
      nextLabel: "Fertig"
    },
    bothMeme: {
      question: "Findest du nicht das ist ein bisschen viel? 😤",
      image: "greedy_cat.jpg"
    }
  };

  let surveyIndex = 0;
  let surveyAnswers = [];
  let surveyBranch = null;

  const renderOptions = (options) => options.map((option) => `
    <label>
      <input type="radio" name="giftChoice" value="${option}">
      ${option}
    </label>
  `).join("");

  function renderSurveyStep() {
    surveyBackButton.hidden = true;
    submitSurveyButton.hidden = false;

    if (surveyBranch === "both") {
      surveyQuestion.textContent = surveySteps.bothMeme.question;
      surveyOptions.innerHTML = `<div class="meme-card"><img src="${surveySteps.bothMeme.image}" alt="Vorwurfsvoller Blick der gierigen Katze"></div>`;
      submitSurveyButton.hidden = true;
      surveyBackButton.hidden = false;
      surveyBackButton.textContent = "Zurück zur ersten Frage";
      return;
    }

    if (surveyBranch === "steam") {
      const step = surveySteps.steam;
      surveyQuestion.textContent = step.question;
      surveyOptions.innerHTML = renderOptions(step.options);
      submitSurveyButton.textContent = step.nextLabel;
      return;
    }

    if (surveyBranch === "essen") {
      if (surveyIndex === 1) {
        const step = surveySteps.essen;
        surveyQuestion.textContent = step.question;
        surveyOptions.innerHTML = renderOptions(step.options);
        submitSurveyButton.textContent = step.nextLabel;
        return;
      }

      const step = surveySteps.essenChoice;
      surveyQuestion.textContent = step.question;
      surveyOptions.innerHTML = renderOptions(step.options);
      submitSurveyButton.textContent = step.nextLabel;
      return;
    }

    if (surveyIndex === 0) {
      const step = surveySteps.first;
      surveyQuestion.textContent = step.question;
      surveyOptions.innerHTML = renderOptions(step.options);
      submitSurveyButton.textContent = step.nextLabel;
      return;
    }
  }

  surpriseButton.addEventListener("click", () => {
    surveyPanel.classList.add("open");
    surpriseButton.hidden = true;
    surveyIndex = 0;
    surveyAnswers = [];
    surveyBranch = null;
    renderSurveyStep();

    surpriseButton.textContent = "Noch eine Überraschung";
  });

  surveyBackButton.addEventListener("click", () => {
    surveyBranch = null;
    surveyIndex = 0;
    surveyAnswers = [];
    renderSurveyStep();
  });

  submitSurveyButton.addEventListener("click", () => {
    const chosen = document.querySelector('input[name="giftChoice"]:checked');

    if (!chosen) {
      return;
    }

    surveyAnswers.push(chosen.value);

    if (surveyIndex === 0) {
      const firstChoice = chosen.value;

      if (firstChoice === "Steam Gutschein für mehr Flugzeuge") {
        surveyBranch = "steam";
        surveyIndex = 1;
        renderSurveyStep();
        return;
      }

      if (firstChoice === "Essen gehen mit Lisa und Mirco") {
        surveyBranch = "essen";
        surveyIndex = 1;
        renderSurveyStep();
        return;
      }

      if (firstChoice === "Beides") {
        surveyBranch = "both";
        surveyIndex = 1;
        renderSurveyStep();
        return;
      }
    }

    if (surveyBranch === "steam") {
      surveyPanel.classList.remove("open");
      surpriseButton.hidden = false;
      return;
    }

    if (surveyBranch === "essen") {
      if (surveyIndex === 1) {
        surveyIndex = 2;
        renderSurveyStep();
        return;
      }

      surveyPanel.classList.remove("open");
      surpriseButton.hidden = false;
      return;
    }

    if (surveyIndex < 2) {
      surveyIndex += 1;
      renderSurveyStep();
      return;
    }

    surveyPanel.classList.remove("open");
    surpriseButton.hidden = false;
  });
}
