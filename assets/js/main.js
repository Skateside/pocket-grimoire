import Dialog from "./classes/Dialog.js";
import Observer from "./classes/Observer.js";
import Tokens from "./classes/Tokens.js";
import CharacterData from "./classes/CharacterData.js";
import GameData from "./classes/GameData.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    identify
} from "./utils/elements.js";

lookupCached("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});



const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

const characterData = CharacterData.create();
characterData.then((characters) => {
    gameObserver.trigger("characters-loaded", characters);
});

gameObserver.on("characters-loaded", () => {
    lookupOne("#select-characters").disabled = false;
});

const editionList = lookupOne("#edition-list");
const editionListDialog = Dialog.create(editionList);
const characterSelectTemplate = lookupOne("#character-select-template");

editionList.addEventListener("click", ({ target }) => {

    const button = target.closest("[data-edition]");

    if (!button) {
        return;
    }

    const {
        edition
    } = button.dataset;

    characterData.getEdition(edition).then((characters) => {
        gameObserver.trigger("characters-selected", characters);
    });

});

gameObserver.on("characters-selected", ({ detail: characters }) => {

    lookupCached("[data-team]").forEach((wrapper) => {

        const wrapperTeam = wrapper.dataset.team;
        const list = lookupOneCached(".js--character-select--list", wrapper);

        list.innerHTML = "";
        const frag = document.createDocumentFragment();

        characters.forEach(({
            id,
            team,
            image,
            name,
            ability,
            setup
        }) => {

            if (team !== wrapperTeam) {
                return;
            }

            const clone = characterSelectTemplate.content.cloneNode(true);
            const label = clone.querySelector(".js--character-select--label");
            const input = clone.querySelector(".js--character-select--input");
            const img = clone.querySelector(".js--character-select--image");
            const nameText = clone.querySelector(".js--character-select--name");
            const abilityText = clone.querySelector(".js--character-select--ability");

            label.htmlFor = identify(input);
            input.value = id;
            img.src = image;
            nameText.textContent = name;
            abilityText.textContent = ability;

            if (setup) {
                nameText.classList.add("is-setup");
            }

            frag.append(clone);

        });

        list.append(frag);

    });

    editionListDialog.hide();

});

lookupCached("[data-team]").forEach((wrapper) => {

    const countElement = lookupOneCached(".js--character-select--count", wrapper);

    wrapper.addEventListener("change", ({ target }) => {

        gameObserver.trigger("character-toggle", {
            id: target.value,
            active: target.checked
        });

        countElement.textContent = lookup(
            "input[type=\"checkbox\"]:checked",
            wrapper
        ).length;

    });

});

const playerCount = lookupOne("#player-count");
const playerCountOutput = lookupOne("#player-count-output");

playerCount.addEventListener("input", () => {
    playerCountOutput.value = playerCount.value;
});



const gameData = GameData.create();

function setTotals() {

    gameData.getRow(playerCount.value).then((data) => {

        Object.entries(data).forEach(([team, count]) => {

            lookupCached(`[data-team="${team}"] .js--character-select--total`)
                .forEach((element) => {
                    element.textContent = count;
                });

        });

    })

}

playerCount.addEventListener("input", setTotals);
gameData.then(setTotals);


gameObserver.on("characters-selected", ({ detail: characters }) => {

    const template = lookupOneCached("#character-list-template");
    const frag = characters.reduce((frag, character) => {

        const clone = template.content.cloneNode(true);
        const button = clone.querySelector(".js--character-list--button");
        const token = clone.querySelector(".js--character-list--token");

        button.dataset.id = character.id;
        button.dataset.character = JSON.stringify(character);
        token.append(drawCharacter(character));

        frag.append(clone);

        return frag;

    }, document.createDocumentFragment());

    const list = lookupOneCached("#character-list__list");
    list.innerHTML = "";
    list.append(frag);

});

function drawCharacter({
    id,
    name,
    image,
    reminders = [],
    remindersGlobal = [],
    firstNight,
    otherNight,
    setup
}) {

    const clone = lookupOneCached("#character-template").content.cloneNode(true);
    const leaves = clone.querySelector(".js--character--leaves");

    leaves.classList.toggle("character--setup", setup);
    leaves.classList.toggle("character--left-1", firstNight);
    leaves.classList.toggle("character--right-1", otherNight);
    const totalTop = reminders.length + remindersGlobal.length;
    leaves.classList.toggle(`character--top-${totalTop}`, totalTop);

    clone.querySelector(".js--character--image").src = image;
    clone.querySelector(".js--character--name").textContent = name;

    return clone;

}

lookupOneCached("#character-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-id]");

    if (!button) {
        return;
    }

    const character = JSON.parse(button.dataset.character);
    const tokenTemplate = lookupOneCached("#token-template").content.cloneNode(true);
    const wrapper = tokenTemplate.querySelector(".js--token--wrapper");
    wrapper.dataset.id = character.id;
    wrapper.dataset.token = "character";
    wrapper.dataset.character = JSON.stringify(character);
    wrapper.append(drawCharacter(character));

    lookupOneCached(".pad").append(wrapper);
    tokenObserver.trigger("character-added", {
        data: character,
        element: wrapper
    });

    Dialog.create(button.closest(".dialog")).hide();

});

const pad = lookupOneCached(".pad");
pad.tokens = new Tokens(pad);

// If the elements are within a closed <details> element then their height and
// width will be 0. Listen for the pad becoming visible and update the class.
lookup("details").forEach((details) => {

    details.addEventListener("toggle", ({ target }) => {
        pad.tokens.updatePadDimensions();
    });

});

function drawReminder({
    id,
    image,
    text
}) {

    const clone = lookupOneCached("#reminder-template").content.cloneNode(true);
    clone.querySelector(".js--reminder--image").src = image;
    clone.querySelector(".js--reminder--text").textContent = text;

    return clone;

}

function drawReminderEntry(reminder) {

    const clone = lookupOneCached("#reminder-list-template").content.cloneNode(true);
    const button = clone.querySelector(".js--reminder-list--button");
    button.dataset.id = reminder.id;
    button.dataset.reminder = JSON.stringify(reminder);
    button.append(drawReminder(reminder));

    return clone;

}

gameObserver.on("characters-selected", ({ detail: characters }) => {

    const frag = document.createDocumentFragment();

    characters.forEach(({
        id,
        image,
        reminders = [],
        remindersGlobal = []
    }) => {

        const allReminders = [].concat(reminders, remindersGlobal);

        allReminders.forEach((reminder) => {

            frag.append(drawReminderEntry({
                image,
                id,
                text: reminder
            }));

        });

    });

    const reminders = lookupOneCached("#reminder-list__list");
    reminders.innerHTML = "";
    reminders.append(frag);

});

lookupOneCached("#reminder-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-id]");

    if (!button) {
        return;
    }

    const reminder = JSON.parse(button.dataset.reminder);
    const tokenTemplate = lookupOneCached("#token-template").content.cloneNode(true);
    const wrapper = tokenTemplate.querySelector(".js--token--wrapper");
    wrapper.dataset.id = reminder.id;
    wrapper.dataset.token = "reminder";
    wrapper.dataset.reminder = JSON.stringify(reminder);
    wrapper.append(drawReminder(reminder));

    lookupOneCached(".pad").append(wrapper);
    gameObserver.trigger("reminder-added", {
        data: reminder,
        element: wrapper
    });

    Dialog.create(button.closest(".dialog")).hide();

});

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".pad").style.height = "";
});

lookupOne("#clear-grimoire").addEventListener("click", () => {

    if (window.confirm("Are you sure you want to clear all the tokens?")) {

        const pad = lookupOneCached(".pad");

        pad.innerHTML = "";
        pad.tokens.reset();

    }

});

tokenObserver.on("reminder-click", ({ detail }) => {

    const {
        element
    } = detail;

    element.remove();
    tokenObserver.trigger("reminder-removed", detail);

});

class CharacterDialog extends Dialog {

    addListeners() {

        super.addListeners();

        this.buttonShroud = lookupOneCached("#character-shroud-toggle");
        this.buttonRemove = lookupOneCached("#character-remove");
        this.tokenWrapper = lookupOneCached("#character-show-token");
        this.nameText = lookupOneCached("#character-show-name");
        this.abilityText = lookupOneCached("#character-show-ability");

        this.buttonShroud.addEventListener("click", () => {
            this.toggleShroud();
        });

        this.buttonRemove.addEventListener("click", () => {
            this.removeToken();
        });

        this.dialog.addEventListener(this.constructor.HIDE, () => {

            this.buttonShroud.disabled = true;
            this.buttonRemove.disabled = true;
            this.tokenWrapper.innerHTML = "";
            this.nameText.textContent = "";
            this.abilityText.textContent = "";

        });

    }

    setTokenData(tokenData) {

        this.tokenData = tokenData;
        this.token = lookupOneCached(
            ".js--character--leaves",
            tokenData.element
        );

        const clone = this.token.cloneNode(true);
        clone.removeAttribute("data-first-night");
        clone.removeAttribute("data-other-nights");
        clone.classList.remove("is-dead");
        this.tokenWrapper.append(clone);
        this.nameText.textContent = tokenData.data.name;
        this.abilityText.textContent = tokenData.data.ability;

        this.buttonShroud.disabled = false;
        this.buttonRemove.disabled = false;

    }

    toggleShroud() {

        const isDead = this.token.classList.toggle("is-dead");

        tokenObserver.trigger("character-shroud-change", {
            ...this.tokenData,
            isDead
        });
        this.hide();

    }

    removeToken() {

        const {
            tokenData
        } = this;

        tokenData.element.remove();
        tokenObserver.trigger("character-removed", tokenData);
        this.hide();

    }

}

tokenObserver.on("character-click", ({ detail }) => {

    const dialogElement = lookupOneCached("#character-show");
    const dialog = CharacterDialog.create(dialogElement);

    dialog.setTokenData(detail);
    dialog.show();

});

// Night Order.
//*
function drawNightOrder({
    id,
    name,
    image,
    text
}) {

    const clone = lookupOneCached("#night-info-template").content.cloneNode(true);

    lookupOne(".js--night-info--wrapper", clone).dataset.id = id;
    lookupOne(".js--night-info--icon", clone).src = image;
    lookupOne(".js--night-info--role", clone).textContent = name;
    lookupOne(".js--night-info--ability", clone).textContent = text;

    return clone;

}

gameObserver.on("characters-selected", ({ detail: characters }) => {

    const nights = [[], []];

    characters.forEach(({
        id,
        name,
        image,
        firstNight,
        firstNightReminder,
        otherNight,
        otherNightReminder
    }) => {

        const data = {
            id,
            name,
            image,
        };

        if (firstNight) {

            data.text = firstNightReminder;
            nights[0][firstNight] = data;

        }

        if (otherNight) {

            data.text = otherNightReminder;
            nights[1][otherNight] = data;

        }

    });

    const firstNight = lookupOneCached("#first-night")
    firstNight.innerHTML = "";
    nights[0].forEach((data) => {
        firstNight.append(drawNightOrder(data));
    });

    const otherNights = lookupOneCached("#other-nights")
    otherNights.innerHTML = "";
    nights[1].forEach((data) => {
        otherNights.append(drawNightOrder(data));
    });

});

tokenObserver.on("character-added", ({ detail }) => {

    const {
        id
    } = detail.data;
    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {
        firstNight.classList.add("is-playing");
    }

    if (otherNights) {
        otherNights.classList.add("is-playing");
    }

});

tokenObserver.on("character-removed", ({ detail }) => {

    const {
        id
    } = detail.data;
    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {
        firstNight.classList.remove("is-playing");
    }

    if (otherNights) {
        otherNights.classList.remove("is-playing");
    }

});
//*/
// End of Night Order.
