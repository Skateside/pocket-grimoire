import Template from "../classes/Template.js";
import InfoToken from "../classes/InfoToken.js";
import Observer from "../classes/Observer.js";
import Dialog from "../classes/Dialog.js";
import {
    lookupOne
} from "../utils/elements.js";

const buttonHolder = lookupOne("#info-token-button-holder");
const dialogHolder = lookupOne("#info-token-dialog-holder");

InfoToken.setTemplates({
    button: Template.create(lookupOne("#info-token-button-template")),
    dialog: Template.create(lookupOne("#info-token-dialog-template"))
});
InfoToken.setHolders({
    button: buttonHolder,
    custom: lookupOne("#info-token-custom-holder"),
    dialog: dialogHolder
});

JSON.parse(buttonHolder.dataset.infoTokens).forEach((data) => {

    const token = new InfoToken(data);
    token.draw();

});

const observer = Observer.create("info-token");

lookupOne("#add-info-token").addEventListener("click", () => {

    const text = window.prompt(window.I18N.customInfoToken);

    if (!text) {
        return;
    }

    const token = new InfoToken({
        raw: text,
        custom: true
    });
    token.draw();

    observer.trigger("info-token-added", {
        token
    });

});

const dialog2token = new WeakMap();

observer.on("info-token-added", ({ detail }) => {

    const {
        token
    } = detail;

    dialog2token.set(token.getDialog(), token);

});

function editToken(token, raw) {

    token.updateRaw(raw);
    observer.trigger("info-token-updated", {
        token
    });

}

function deleteToken(token) {

    Dialog.create(token.getDialog()).hide();
    token.remove();
    observer.trigger("info-token-deleted", {
        token
    });

}

dialogHolder.addEventListener("click", ({ target }) => {

    const button = target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const token = dialog2token.get(button.closest(".js--info-token--dialog"));

    if (!token) {
        return;
    }

    switch (button.dataset.action) {

    case "edit":

        const data = token.getData();
        const text = window.prompt(window.I18N.customInfoToken, data.raw);

        if (text) {
            editToken(token, text);
        } else {
            deleteToken(token);
        }

        break;

    case "delete":

        deleteToken(token);
        break;

    }

});
