const RESULT_FILE_NAME = "Happy-Linus-Ergebnis.txt";
const RESULT_FILE_ID_KEY = "RESULT_FILE_ID";

function doGet(event) {
  const status = getPublicStatus();
  const parameters = event && event.parameter ? event.parameter : {};
  const callback = String(parameters.callback || "");

  if (callback) {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
      return jsonResponse({ error: "Invalid callback" });
    }

    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(status)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonResponse(status);
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(10000)) {
    return jsonResponse({ ok: false, error: "Busy" });
  }

  try {
    const properties = PropertiesService.getScriptProperties();
    if (properties.getProperty(RESULT_FILE_ID_KEY)) {
      return jsonResponse({ ok: false, error: "Already completed" });
    }

    const payload = JSON.parse(event.postData.contents || "{}");
    const result = String(payload.result || "").trim();
    const lines = result.split(/\r?\n/);

    if (
      result.length > 5000 ||
      lines.length !== 2 ||
      !lines[0].startsWith("Ausgabe") ||
      !lines[1].startsWith("Komplettes Ergebnis:")
    ) {
      return jsonResponse({ ok: false, error: "Invalid result" });
    }

    const file = DriveApp.createFile(RESULT_FILE_NAME, result, MimeType.PLAIN_TEXT);
    properties.setProperty(RESULT_FILE_ID_KEY, file.getId());
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Could not save result" });
  } finally {
    lock.releaseLock();
  }
}

function getPublicStatus() {
  const fileId = PropertiesService.getScriptProperties().getProperty(RESULT_FILE_ID_KEY);
  if (!fileId) return { completed: false, result: "" };

  try {
    const content = DriveApp.getFileById(fileId).getBlob().getDataAsString("UTF-8").trim();
    const output = content.split(/\r?\n/, 1)[0] || "";
    return { completed: Boolean(content), result: output };
  } catch (error) {
    return { completed: false, result: "" };
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
