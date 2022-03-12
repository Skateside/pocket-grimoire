import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import {
    empty,
    identify,
    lookupOne,
    lookupOneCached
} from "../../utils/elements.js";

const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;

TokenStore.ready((tokenStore) => {

    lookupOneCached("#reminder-list__list").addEventListener("click", ({ target }) => {

        const button = target.closest("[data-reminder-id]");

        if (!button) {
            return;
        }

        pad.addReminder(tokenStore.getReminder(button.dataset.reminderId));
        Dialog.create(lookupOneCached("#reminder-list")).hide();

    });

    const reminderDialog = Dialog.create(lookupOne("#reminder-show"));
    const reminderHolder = lookupOne("#reminder-show-token");

    tokenObserver.on("reminder-click", ({ detail }) => {

        const {
            element
        } = detail;
        const reminder = tokenStore.getReminder(element.dataset.reminder);

        empty(reminderHolder).append(reminder.drawToken());
        reminderHolder.dataset.token = `#${identify(element)}`;
        reminderDialog.show();

    });

    lookupOne("#reminder-remove").addEventListener("click", () => {

        const token = lookupOne(reminderHolder.dataset.token);

        if (!token) {
            return;
        }

        pad.removeReminderByToken(token);
        reminderDialog.hide();

    });

    const counts = Object.create(null);
    const list = lookupOneCached("#reminder-list__list");

    tokenObserver.on("character-add", ({ detail }) => {

        const {
            character
        } = detail;
        const characterId = character.getId();

        if (!counts[characterId]) {
            counts[characterId] = 0;
        }

        counts[characterId] += 1;

        character.getReminders().forEach((reminder) => {

            lookupOne(
                `[data-reminder-id="${reminder.getId()}"]`,
                list
            )?.classList.add("is-in-play");

        });

    });

    tokenObserver.on("character-remove", ({ detail }) => {

        const {
            character
        } = detail;
        const characterId = character.getId();

        if (counts[characterId]) {
            counts[characterId] -= 1;
        }

        if (!counts[characterId]) {

            character.getReminders().forEach((reminder) => {

                lookupOne(
                    `[data-reminder-id="${reminder.getId()}"]`,
                    list
                )?.classList.remove("is-in-play");

            });

        }

    });

    lookupOne("#show-all-reminders").addEventListener("change", ({ target }) => {
        list.classList.toggle("is-show-all", target.checked);
    });

});
