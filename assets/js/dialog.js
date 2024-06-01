import dialogPolyfill from "./lib/dialog-polyfill.js";

const dialogs = document.querySelectorAll("dialog");

dialogs.forEach((dialog) => {

    dialog.classList.add("dialog--polyfilled");
    dialogPolyfill.registerDialog(dialog);

});

// Attempt to fix a bug on Firefox Mobile where the overlay wouldn't cover the
// entire screen when the browser UI changed size - #109.
const observer = new MutationObserver((list) => {

    list.forEach(({ type, attributeName, target }) => {

        if (type !== "attributes" || attributeName !== "open" || !target.open) {
            return;
        }

        const width = `${document.body.offsetWidth}px`;
        const height = `${document.body.offsetHeight}px`;

        const backdrop = target.nextSibling;
        if (backdrop.className.match(/\bbackdrop\b/)) {
            backdrop.style.setProperty("--width", width);
            backdrop.style.setProperty("--height", height);
        }

        const overlay = document.querySelector("._dialog_overlay");
        if (overlay) {
            overlay.style.setProperty("--width", width);
            overlay.style.setProperty("--height", height);
        }

    });

});
dialogs.forEach((dialog) => observer.observe(dialog, { attributes: true }));
