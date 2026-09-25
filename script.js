/*
  EINSTELLUNGEN
  -------------
  START_DATE: Datum, seit dem gezählt wird (YYYY-MM-DD).
  EXPIRES_AFTER_DAYS: Nach dieser Anzahl Tagen wird die Seite ausgeblendet.
  Für "maximal 1 Jahr" stehen hier 365 Tage.
*/
const START_DATE = "2026-09-25";
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
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor((now - start) / MS_PER_DAY));

  document.getElementById("days").textContent =
    new Intl.NumberFormat("de-DE").format(days);

  document.getElementById("sinceText").textContent =
    `Seit dem ${start.toLocaleDateString("de-DE")} – und jeder Tag zählt.`;

  // Alle paar Sekunden ein kleiner Wechsel beim Text.
  const messages = [
    "Eine kleine Reise durch die Zeit. 🚂",
    "Noch ein Tag voller Erinnerungen. ✨",
    "Happy Birthday! 🎉",
    "Zeit für Kuchen! 🍰",
    "Volle Fahrt voraus! 🚂💨"
  ];

  let i = 0;
  setInterval(() => {
    i = (i + 1) % messages.length;
    document.getElementById("message").textContent = messages[i];
  }, 6000);
}
