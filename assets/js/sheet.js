import Dialog from "./classes/Dialog.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached
} from "./utils/elements.js";
import QRCode from "./lib/qrcode-svg.js";

// Generate the QR code.
lookupOne("#qr-code").append(QRCode({
    msg: window.location.href,
    ecl: "L"
}));

// Activate the dialogs.
lookup("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

// Force the details to be open when printing.
function openAllDetails() {

    lookupCached(".details").forEach((details) => {

        if (details.dataset.open) {
            return;
        }

        details.dataset.open = details.open;
        details.open = true;

    });

}

function closeDetails() {

    lookupCached(".details").forEach((details) => {

        if (!details.dataset.open) {
            return;
        }

        details.open = details.dataset.open === "true";
        delete details.dataset.open;

    });

}

const printQuery = window.matchMedia("print");
printQuery.addEventListener("change", ({ matches }) => {

    if (matches) {
        openAllDetails();
    } else {
        closeDetails();
    }

});

if (printQuery.matches) {
    openAllDetails();
}

window.addEventListener("beforeprint", openAllDetails);
window.addEventListener("afterprint", closeDetails);

// Change Language.
lookupOne("#locale-form").addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = lookupOneCached("#select-locale").value;
});
lookupOneCached("#select-locale").addEventListener("change", ({ target }) => {
    target.form.requestSubmit();
});
