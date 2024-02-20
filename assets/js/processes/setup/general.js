import Store from "../../classes/Store.js";
import Observer from "../../classes/Observer.js";
import Template from "../../classes/Template.js";
import CharacterToken from "../../classes/CharacterToken.js";
import ReminderToken from "../../classes/ReminderToken.js";
import TokenStore from "../../classes/TokenStore.js";
import Dialog from "../../classes/Dialog.js";
import Names from "../../classes/Names.js";
import {
    fetchFromStore
} from "../../utils/fetch.js";
import {
    lookup,
    lookupOne,
    lookupOneCached
} from "../../utils/elements.js";
import {
    LANGUAGE
} from "../../constants/language.js";

const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");

fetchFromStore(`characters_${LANGUAGE}`, URLS.characters, store).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

fetchFromStore(`jinxes_${LANGUAGE}`, URLS.jinxes, store).then((jinxes) => {
    gameObserver.trigger("jinxes-loaded", { jinxes });
});

fetchFromStore("game", URLS.game, store).then((breakdown) => {
    gameObserver.trigger("team-breakdown-loaded", { breakdown });
});

CharacterToken.setTemplates({
    token: Template.create(lookupOne("#character-template")),
    list: Template.create(lookupOne("#character-list-template")),
    select: Template.create(lookupOne("#character-select-template")),
    nightOrder: Template.create(lookupOne("#night-info-template"))
});
ReminderToken.setTemplates({
    token: Template.create(lookupOne("#reminder-template")),
    list: Template.create(lookupOne("#reminder-list-template"))
});
Names.create()
    .setTemplate(Template.create(lookupOne("#player-name-template")))
    .setObserver(new Observer());

Promise.all([
    new Promise((resolve) => {
        gameObserver.on("characters-loaded", ({ detail }) => {
            resolve(detail.characters);
        });
    }),
    new Promise((resolve) => {
        gameObserver.on("jinxes-loaded", ({ detail }) => {
            resolve(detail.jinxes);
        });
    })
]).then(([ characters, jinxes ]) => {

    TokenStore.create({
        characters: [
            // Create an empty character which we can use as a token placeholder.
            {
                id: TokenStore.EMPTY,
                image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                ability: I18N.emptyCharacterAbility,
                [CharacterToken.empty]: true,
            },
            ...characters
        ],
        reminders: [
            {
                id: TokenStore.EMPTY,
                name: "",
                text: I18N.goodTeam,
                image: "/build/img/icons/townsfolk.png",
                isGlobal: true
            },
            {
                id: TokenStore.EMPTY,
                name: "",
                text: I18N.evilTeam,
                image: "/build/img/icons/demon.png",
                isGlobal: true
            }
        ],
        jinxes
    });

});

// Delegate this event for two reasons:
// 1. We can add dialogs dynamically and they'll still work.
// 2. It's more efficient to only create the instance when it's needed.
document.body.addEventListener("click", ({ target }) => {

    if (target.hasAttribute("data-dialog") && !target.dialog) {

        target.dialog = Dialog.createFromTrigger(target);
        target.dialog.show();

    }

});

lookup("input[data-filter-list]").forEach((input) => {

    input.addEventListener("change", ({ target }) => {

        const list = lookupOneCached(target.dataset.filterList);

        if (!list) {
            return;
        }

        list.classList.toggle("is-show-all", target.checked);

    });

});

lookupOne("#locale-form").addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = lookupOneCached("#select-locale").value;
});

lookupOneCached("#select-locale").addEventListener("change", ({ target }) => {
    target.form.requestSubmit();
});

function setTrackWidth(input) {

    const {
        min,
        max,
        value
    } = input;

    input.style.setProperty(
        "--size",
        ((value - min) * 100) / (max - min)
    );

}

const rangeObserver = new MutationObserver((entries) => {

    entries.forEach(({ type, target }) => {

        if (type == "attributes") {
            setTrackWidth(target);
        }

    });

});

lookup("input[type=\"range\"][data-output]").forEach((input) => {

    const output = lookupOne(input.dataset.output);

    input.addEventListener("input", () => {

        setTrackWidth(input);

        if (output) {
            output.value = input.value
        }

    });

    setTrackWidth(input);
    rangeObserver.observe(input, {
        attributes: true,
        attributeFilter: ["min", "max", "value"]
    });

});
