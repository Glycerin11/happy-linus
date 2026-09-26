/*
  EINSTELLUNGEN
  -------------
  START_DATE: Datum, seit dem gezählt wird (YYYY-MM-DD).
  EXPIRES_AFTER_DAYS: Nach dieser Anzahl Tagen wird die Seite ausgeblendet.
  Für "maximal 1 Jahr" stehen hier 365 Tage.
*/
const START_DATE = "2026-09-26";
const EXPIRES_AFTER_DAYS = 365;
const APPS_SCRIPT_URL = "";

const start = new Date(`${START_DATE}T14:00:00`);
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
  const sun = document.querySelector(".sun");
  const rainLayer = document.querySelector(".rain-layer");
  const thunder = document.querySelector(".thunder");

  const pad = (value) => String(value).padStart(2, "0");

  const updateWeather = () => {
    const diffMs = Math.max(0, Date.now() - start.getTime());
    const totalDays = Math.floor(diffMs / 86400000);
    const isGrayCloud = totalDays >= 60;
    const isRain = totalDays >= 100;
    const isRainOnly = totalDays >= 150;
    const isThunder = totalDays >= 250;

    sun.classList.toggle("hidden", isRain);
    rainLayer.classList.toggle("visible", isRainOnly);
    thunder.classList.toggle("visible", isThunder);

    cloud1.classList.toggle("gray", !isRain && isGrayCloud);
    cloud2.classList.toggle("gray", false);
    cloud1.classList.toggle("rain-heavy", isRain);
    cloud2.classList.toggle("rain-heavy", isRain);

    if (isRain) {
      cloud1.textContent = "☁️☁️";
      cloud2.textContent = "☁️☁️";
      return;
    }

    if (isGrayCloud) {
      cloud1.textContent = "☁️";
      cloud2.textContent = "";
      return;
    }

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

    sinceTextNode.textContent = `Seit dem ${start.toLocaleDateString("de-DE")}, 14:00:00 Uhr – und die Zeit läuft.`;
    updateWeather();
  };

  updateTimer();
  setInterval(updateTimer, 1000);
  loadSurveyStatus();

  const surveySteps = {
    first: {
      question: "Frage 1: Welches Geschenk?",
      options: ["Steam Gutschein für mehr Flugzeuge", "Essen gehen mit Lisa und Mirco", "Beides"],
      nextLabel: "Weiter"
    },
    steam: {
      question: "Sicher?",
      options: ["Ja, sicher", "Nein, natürlich will ich Zeit mit meinen Freunden verbringen"],
      nextLabel: "Weiter"
    },
    essen: {
      question: "Frage 2: Welche Termine und Art des Treffens passen dir?",
      nextLabel: "Weiter"
    },
    essenChoice: {
      question: "Frage 3: Wollt ihr selbst wählen, wohin wir euch einladen oder sollen wir wählen?",
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
  let surveyGiftChoice = null;
  let finalMessage = "";
  let showResult = false;
  let surveyCompleted = false;
  let surveyResultText = "";
  let chosenMealType = "Mittagessen";
  let chosenDate1 = "";
  let chosenDate2 = "";

  const renderOptions = (options) => options.map((option) => `
    <label>
      <input type="radio" name="giftChoice" value="${option}">
      ${option}
    </label>
  `).join("");

  function buildSurveySummary() {
    if (!surveyAnswers.length) return "Keine Auswahl";
    return surveyAnswers.join(" • ");
  }

  function buildFinalResultText() {
    if (surveyGiftChoice === "Steam Gutschein für mehr Flugzeuge" && surveyAnswers[1] === "Ja, sicher") {
      return "Steam-Gutschein • Bitte schicke mir eine Whats-App, damit ich dir den Gutschein auf Steam senden kann";
    }

    if (surveyGiftChoice === "Essen gehen mit Lisa und Mirco") {
      return `Wir gehen ${chosenMealType} • Die termine werden manuell geprüft ;)`;
    }

    if (!surveyAnswers.length) return "Keine Auswahl";
    return surveyAnswers.join(" • ");
  }

  function buildStoredResultText() {
    if (surveyGiftChoice === "Steam Gutschein für mehr Flugzeuge" && surveyAnswers[1] === "Ja, sicher") {
      const output = "Steam-Gutschein • Bitte schicke mir eine Whats-App, damit ich dir den Gutschein auf Steam senden kann";
      const completeResult = surveyAnswers.join(" • ");
      return `Ausgabe: ${output}\nKomplettes Ergebnis: ${completeResult}`;
    }

    if (surveyGiftChoice === "Essen gehen mit Lisa und Mirco") {
      const date1 = chosenDate1 || "kein Termin angegeben";
      const date2 = chosenDate2 || "kein Termin angegeben";
      const mealChoice = surveyAnswers[surveyAnswers.length - 1] || "Ihr/ich wählt für uns aus";
      const output = `Wir gehen ${chosenMealType} - Die Termine werden manuell geprüft`;
      const completeResult = `Essen gehen mit Lisa und Mirco • Termine: ${date1} / ${date2} • ${chosenMealType} • ${mealChoice} • Die Termine werden manuell geprüft ;)`;

      return `Ausgabe für Essen gehen: ${output}\nKomplettes Ergebnis: ${completeResult}`;
    }

    const completeResult = surveyAnswers.length ? surveyAnswers.join(" • ") : "Keine Auswahl";
    return `Ausgabe: ${completeResult}\nKomplettes Ergebnis: ${completeResult}`;
  }

  function extractOutputText(result) {
    const outputLine = String(result || "Keine Auswahl").split(/\r?\n/, 1)[0].trim();
    return outputLine.replace(/^Ausgabe(?: für Essen gehen)?:\s*/, "") || "Keine Auswahl";
  }

  function loadAppsScriptStatus() {
    return new Promise((resolve, reject) => {
      const callbackName = `__happyLinusStatus_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const script = document.createElement("script");
      const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
      const timeout = setTimeout(() => finish(new Error("Status request timed out")), 10000);

      function finish(error, data) {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
        if (error) reject(error);
        else resolve(data);
      }

      window[callbackName] = (data) => finish(null, data);
      script.onerror = () => finish(new Error("Status request failed"));
      script.src = `${APPS_SCRIPT_URL}${separator}callback=${callbackName}&_=${Date.now()}`;
      document.head.appendChild(script);
    });
  }

  async function loadSurveyStatus() {
    try {
      let data;
      if (APPS_SCRIPT_URL) {
        data = await loadAppsScriptStatus();
      } else {
        const response = await fetch("/survey-status");
        if (!response.ok) return false;
        data = await response.json();
      }

      if (data.completed) {
        surveyCompleted = true;
        surveyResultText = extractOutputText(data.result);
        surveyPanel.classList.add("open");
        renderSurveyStep();
        surpriseButton.hidden = true;
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  async function saveSurveyResult() {
    const result = buildStoredResultText();

    try {
      let savedResult = result;
      if (APPS_SCRIPT_URL) {
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          },
          body: JSON.stringify({ result })
        });

        const status = await loadAppsScriptStatus();
        if (!status.completed) throw new Error("Save failed");
        savedResult = status.result || result;
      } else {
        const response = await fetch("/save-result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ result })
        });

        if (!response.ok) throw new Error("Save failed");
        const data = await response.json();
        savedResult = data.result || result;
      }

      surveyResultText = extractOutputText(savedResult);
    } catch (error) {
      surveyQuestion.textContent = "Speichern fehlgeschlagen";
      surveyOptions.innerHTML = "<p class=\"final-copy\">Bitte prüfe die Verbindung und versuche es erneut.</p>";
      return;
    }

    surveyCompleted = true;
    showResult = true;
    renderSurveyStep();
  }

  function renderSurveyStep() {
    if (surveyCompleted) {
      surveyBackButton.hidden = true;
      submitSurveyButton.hidden = true;
      surveyQuestion.textContent = "Umfrage abgeschlossen";
      surveyOptions.innerHTML = `
        <div class="final-summary">
          <strong>Ergebnis:</strong>
          <span>${surveyResultText || "Keine Auswahl"}</span>
        </div>
      `;
      return;
    }

    surveyBackButton.hidden = true;
    submitSurveyButton.hidden = false;

    if (surveyBranch === "final") {
      surveyQuestion.textContent = finalMessage || "Umfrage abgeschlossen";

      if (showResult) {
        surveyOptions.innerHTML = `
          <div class="final-summary">
            <strong>Ergebnis:</strong>
            <span>${surveyResultText || buildFinalResultText()}</span>
          </div>
        `;
      } else {
        surveyOptions.innerHTML = "<p class=\"final-copy\">Bitte prüfe deine Auswahl und sende sie ab.</p>";
      }

      surveyBackButton.hidden = false;
      surveyBackButton.textContent = "Von Vorne";
      submitSurveyButton.textContent = "Absenden";
      return;
    }

    if (surveyBranch === "both") {
      surveyQuestion.textContent = surveySteps.bothMeme.question;
      surveyOptions.innerHTML = `<div class="meme-card"><img src="${surveySteps.bothMeme.image}" alt="Vorwurfsvoller Blick der gierigen Katze"></div>`;
      surveyBackButton.hidden = false;
      surveyBackButton.textContent = "Ich bin mir doch nicht sicher - Von Vorne";
      submitSurveyButton.hidden = true;
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
        surveyQuestion.textContent = surveySteps.essen.question;
        surveyOptions.innerHTML = `
          <div class="date-picker-grid">
            <label>
              <span>Terminvorschlag 1</span>
              <input type="date" name="essenDate1">
            </label>
            <label>
              <span>Terminvorschlag 2</span>
              <input type="date" name="essenDate2">
            </label>
            <label class="full-width">
              <span>Art des Treffens</span>
              <select name="essenType">
                <option value="Mittagessen">Mittagessen</option>
                <option value="Kaffee und Kuchen essen">Kaffee und Kuchen essen</option>
                <option value="Abendessen">Abendessen</option>
                <option value="Frühstück/Brunch">Frühstücken/Brunchen</option>
              </select>
            </label>
          </div>
        `;
        submitSurveyButton.textContent = surveySteps.essen.nextLabel;
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
    if (surveyCompleted) {
      surveyPanel.classList.add("open");
      renderSurveyStep();
      return;
    }

    surveyPanel.classList.add("open");
    surpriseButton.hidden = true;
    surveyIndex = 0;
    surveyAnswers = [];
    surveyBranch = null;
    surveyGiftChoice = null;
    chosenDate1 = "";
    chosenDate2 = "";
    chosenMealType = "Mittagessen";
    showResult = false;
    renderSurveyStep();

    surpriseButton.textContent = "Noch eine Überraschung";
  });

  surveyBackButton.addEventListener("click", () => {
    if (surveyCompleted) return;

    surveyBranch = null;
    surveyGiftChoice = null;
    surveyIndex = 0;
    surveyAnswers = [];
    chosenDate1 = "";
    chosenDate2 = "";
    chosenMealType = "Mittagessen";
    finalMessage = "";
    showResult = false;
    renderSurveyStep();
  });

  submitSurveyButton.addEventListener("click", async () => {
    if (surveyCompleted) return;

    if (surveyBranch === "final") {
      await saveSurveyResult();
      return;
    }

    if (surveyBranch === "essen" && surveyIndex === 1) {
      chosenDate1 = document.querySelector('input[name="essenDate1"]')?.value || "";
      chosenDate2 = document.querySelector('input[name="essenDate2"]')?.value || "";
      chosenMealType = document.querySelector('select[name="essenType"]')?.value || "Mittagessen";
      surveyIndex = 2;
      renderSurveyStep();
      return;
    }

    const chosen = document.querySelector('input[name="giftChoice"]:checked');

    if (!chosen) {
      return;
    }

    surveyAnswers.push(chosen.value);

    if (surveyIndex === 0) {
      const firstChoice = chosen.value;
      surveyGiftChoice = firstChoice;

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
      if (chosen.value === "Ja, sicher") {
        surveyBranch = "final";
        finalMessage = "Bitte schicke mir eine Whats-App, damit ich dir den Gutschein auf Steam senden kann";
        renderSurveyStep();
        return;
      }

      surveyBranch = null;
      surveyGiftChoice = null;
      surveyIndex = 0;
      surveyAnswers = [];
      finalMessage = "";
      showResult = false;
      renderSurveyStep();
      return;
    }

    if (surveyBranch === "essen") {
      if (surveyIndex === 1) {
        chosenMealType = document.querySelector('select[name="essenType"]')?.value || "Mittagessen";
        surveyIndex = 2;
        renderSurveyStep();
        return;
      }

      surveyBranch = "final";
      finalMessage = "Danke! Wir freuen uns auf ein gemeinsames Treffen.";
      renderSurveyStep();
      return;
    }

    if (surveyBranch === "both") {
      surveyBranch = "final";
      finalMessage = "Danke! Wir schauen uns das gemeinsam an.";
      renderSurveyStep();
      return;
    }

    if (surveyIndex < 2) {
      surveyIndex += 1;
      renderSurveyStep();
      return;
    }

    surveyBranch = "final";
    finalMessage = "Danke für deine Rückmeldung!";
    renderSurveyStep();
  });
}
