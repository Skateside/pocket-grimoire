import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import {
    lookupOneCached
} from "../../utils/elements.js";

const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;

lookupOneCached("#reminder-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-reminder-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addReminder(tokenStore.getReminder(button.dataset.reminderId));
        Dialog.create(lookupOneCached("#reminder-list")).hide();

    });

});

tokenObserver.on("reminder-click", ({ detail }) => {
    pad.removeReminderByToken(detail.element);
});
