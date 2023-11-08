import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import {
    empty,
    identify,
    lookup,
    lookupOne,
    lookupOneCached
} from "../../utils/elements.js";

const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;
const reminderList = lookupOneCached("#reminder-list");
const reminderListDialog = Dialog.create(reminderList);

function getCoords(element) {
    return JSON.parse(element.dataset.coords || "null");
}

function addReminderQuick(target, tokenStore, coords) {

    const button = target?.closest("[data-reminder-id]");

    if (!button) {
        return;
    }

    const clone = tokenStore.getReminderClone(button.dataset.reminderId);
    const {
        token
    } = pad.addReminder(clone);

    if (coords) {
        pad.moveToken(token, coords.x, coords.y);
    }

    reminderListDialog.hide();

}

function toggleReminder(target) {

    const button = target.closest("[data-reminder-id]");
    const checkbox = lookupOne(
        `.js--reminder-list--checkbox[value="${button?.dataset.reminderId}"]`
    );

    if (!button || !checkbox) {
        return;
    }

    checkbox.checked = !checkbox.checked;

}

TokenStore.ready((tokenStore) => {

    let isAddMultiple = false;

    // Add a reminder to the page if it's clicked from the list.
    lookupOneCached("#reminder-list__list").addEventListener("click", ({ target }) => {

        if (isAddMultiple) {
            toggleReminder(target);
        } else {

            addReminderQuick(target, tokenStore, getCoords(reminderList));
            reminderListDialog.hide();

        }

    });

    const multipleReminders = lookupOne("#multiple-reminders");
    const addAllReminders = lookupOne(".js--reminder-list--multiple");

    multipleReminders.addEventListener("change", () => {

        const isNowAddMultiple = multipleReminders.checked;

        isAddMultiple = isNowAddMultiple;
        addAllReminders.hidden = !isNowAddMultiple;

        if (!isNowAddMultiple) {

            lookup(".js--reminder-list--checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });

        }

    });

    addAllReminders.addEventListener("click", () => {

        const coords = getCoords(reminderList) || { x: 0, y: 0 };

        lookup(".js--reminder-list--checkbox:checked").forEach((checkbox) => {

            // TODO: replace this with a Positioner?
            coords.x += 15;
            coords.y += 15;
            addReminderQuick(
                lookupOne(`.js--reminder-list--button[data-reminder-id="${checkbox.value}"]`),
                tokenStore,
                coords
            );
            checkbox.checked = false;

        });

        reminderListDialog.hide();

    });

    const recentReminders = lookupOneCached("#character-show-reminders");

    // Add a reminder token to the page if the recently-added-reminder is clicked.
    recentReminders.addEventListener("click", ({ target }) => {

        addReminderQuick(target, tokenStore, getCoords(recentReminders));
        Dialog.create(lookupOneCached("#character-show")).hide();

    });

    const reminderDialog = Dialog.create(lookupOne("#reminder-show"));
    const reminderHolder = lookupOne("#reminder-show-token");

    // Populate the reminder dialog as a reminder is clicked.
    tokenObserver.on("reminder-click", ({ detail }) => {

        const {
            element
        } = detail;
        const reminder = tokenStore.getReminder(element.dataset.reminder);

        empty(reminderHolder).append(reminder.drawToken());
        reminderHolder.dataset.token = `#${identify(element)}`;
        reminderDialog.show();

    });

    // Remove a reminder when its "remove" button is clicked.
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

    // If a character is added to the grimoire, make sure that its reminders are
    // visible in the list.
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

    // If a character is removed from the grimoire, and there are no other
    // copies of that character in the grimoire, hide its reminders.
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

reminderListDialog.on(Dialog.HIDE, ({ target }) => {
    target.removeAttribute("data-coords");
});
