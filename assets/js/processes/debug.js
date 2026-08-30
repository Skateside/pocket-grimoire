import { post } from "../utils/fetch.js";

function sendLog(level, data) {
    post("/_js-log", { level, ...data }).catch(() => {
        // Do nothing - don't create another error.
    });
}

window.addEventListener("error", (event) => {
    sendLog("error", {
        message: event.message,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack ?? null,
    });
});

window.addEventListener("unhandledrejection", (event) => {
    sendLog("error", {
        message: String(event.reason),
        stack: event.reason?.stack ?? null,
    });
});

