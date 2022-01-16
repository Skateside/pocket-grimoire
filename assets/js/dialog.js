import dialogPolyfill from "./lib/dialog-polyfill.js";

document.querySelectorAll("dialog").forEach((dialog) => {

    dialog.classList.add("dialog--polyfilled");
    dialogPolyfill.registerDialog(dialog);

});
