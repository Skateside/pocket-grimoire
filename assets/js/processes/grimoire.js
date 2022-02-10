import Pad from "../classes/Pad.js";
import Template from "../classes/Template.js";
import Observer from "../classes/Observer.js";
import TokenStore from "../classes/TokenStore.js";
import Dialog from "../classes/Dialog.js";
import Bluff from "../classes/Bluff.js";
import Bluffs from "../classes/Bluffs.js";
import BluffList from "../classes/BluffList.js";
import BluffDialog from "../classes/BluffDialog.js";
import {
    empty,
    identify,
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    replaceContentsMany
} from "../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

const padElement = lookupOneCached(".js--pad");
const pad = new Pad(padElement, tokenObserver);
padElement.pad = pad;

const styleObserver = new MutationObserver((mutations) => {

    gameObserver.trigger("pad-height-change", {
        height: mutations[0].target.style.height
    });

});

styleObserver.observe(padElement, {
    attributes: true,
    attributeFilter: ["style"]
});

// If the elements are within a closed <details> element then their height and
// width will be 0. Listen for the pad becoming visible and update the class.
lookup("details").forEach((details) => {

    details.addEventListener("toggle", () => {
        pad.updateDimensions();
    });

});

gameObserver.on("characters-selected", ({ detail }) => {

    const characterTemplate = Template.create(
        lookupOneCached("#character-list-template")
    );
    const {
        characters
    } = detail;

    replaceContentsMany(
        lookupOneCached("#character-list__list"),
        characters.map((character) => characterTemplate.draw([
            [
                ".js--character-list--button",
                character.getId(),
                (element, content) => element.dataset.tokenId = content
            ],
            [
                ".js--character-list--token",
                character.drawToken(),
                Template.append
            ]
        ]))
    );

    const reminders = characters.reduce((reminders, character) => {
        return reminders.concat(character.getReminders());
    }, []);
    const reminderTemplate = Template.create(
        lookupOneCached("#reminder-list-template")
    );

    replaceContentsMany(
        lookupOneCached("#reminder-list__list"),
        reminders.map((reminder) => reminderTemplate.draw([
            [
                ".js--reminder-list--button",
                reminder.getId(),
                (element, content) => element.dataset.reminderId = content
            ],
            [
                ".js--reminder-list--button",
                reminder.drawToken(),
                Template.append
            ]
        ]))
    );

});

lookupOneCached("#character-list__list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-token-id]");

    if (!button) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        pad.addCharacter(tokenStore.getCharacter(button.dataset.tokenId));
        Dialog.create(lookupOneCached("#character-list")).hide();

    });

});

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

gameObserver.on("character-drawn", ({ detail }) => {
    pad.addNewCharacter(detail.character);
});

tokenObserver.on("character-click", ({ detail }) => {

    const {
        element
    } = detail;
    const character = pad.getCharacterByToken(element);
    const dialog = lookupOneCached("#character-show");
    dialog.dataset.token = `#${identify(element)}`;

    lookupOneCached("#character-show-name").textContent = character.getName();
    empty(lookupOneCached("#character-show-token")).append(character.drawToken());
    lookupOneCached("#character-show-ability").textContent = character.getAbility();

    Dialog.create(dialog).show();

});

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(
        lookupOne(target.closest("[data-token]").dataset.token)
    );
    Dialog.create(target.closest(".dialog")).hide();

});

lookupOne("#character-rotate").addEventListener("click", ({ target }) => {

    pad.rotateByToken(
        lookupOne(target.closest("[data-token]").dataset.token)
    );
    Dialog.create(target.closest(".dialog")).hide();

});

lookupOne("#character-remove").addEventListener("click", ({ target }) => {

    pad.removeCharacterByToken(
        lookupOne(target.closest("[data-token]").dataset.token)
    );
    Dialog.create(target.closest(".dialog")).hide();

});

// Reminders.

tokenObserver.on("reminder-click", ({ detail }) => {
    pad.removeReminderByToken(detail.element);
});

// Demon Bluffs.

const bluffs = Bluffs.create(
    lookupCached(".js--character-list--bluff").map((button) => new Bluff(button)),
    tokenObserver
);

TokenStore.ready(({ characters }) => {

    const noCharacter = characters[TokenStore.EMPTY];

    bluffs.setNoCharacter(noCharacter);
    bluffs.reset(false);

});

lookupCached("[data-bluff-dialog]").forEach((trigger) => {
    trigger.dialog = BluffDialog.createFromTrigger(trigger);
});

gameObserver.on("characters-selected", ({ detail }) => {

    TokenStore.ready((tokenStore) => {

        const characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );
        const characters = [
            tokenStore.characters[TokenStore.EMPTY],
            ...detail.characters
        ];

        replaceContentsMany(
            lookupOneCached("#character-list__bluffs"),
            characters.map((character) => characterTemplate.draw([
                [
                    ".js--character-list--item",
                    {
                        id: character.getId(),
                        team: character.getTeam()
                    },
                    (element, { id, team }) => {

                        element.dataset.characterId = id;
                        element.dataset.team = team;

                    }
                ],
                [
                    ".js--character-list--button",
                    character.getId(),
                    (element, content) => element.dataset.tokenId = content
                ],
                [
                    ".js--character-list--token",
                    character.drawToken(),
                    Template.append
                ]
            ]))
        );

    });

});

function markInPlay(character, shouldAdd = true) {

    const inPlay = lookupOne(
        `#character-list__bluffs [data-character-id="${character.getId()}"]`
    );

    if (inPlay) {
        inPlay.classList.toggle("is-in-play", shouldAdd === true);
    }

}

gameObserver.on("character-drawn", ({ detail }) => {
    markInPlay(detail.character);
});

tokenObserver.on("character-add", ({ detail }) => {
    markInPlay(detail.character);
});

tokenObserver.on("character-remove", ({ detail }) => {
    markInPlay(detail.character, false);
});

lookupOne("#show-existing").addEventListener("change", ({ target }) => {

    lookupOneCached("#character-list__bluffs")
        .classList
        .toggle("is-show-existing", target.checked)

});

lookupOne("#show-travellers").addEventListener("change", ({ target }) => {

    lookupOneCached("#character-list__bluffs")
        .classList
        .toggle("is-show-travellers", target.checked)

});

lookupOne("#show-evil").addEventListener("change", ({ target }) => {

    lookupOneCached("#character-list__bluffs")
        .classList
        .toggle("is-show-evil", target.checked)

});

// const bluffListWrapper = lookupOneCached("#bluff-list");
const bluffList = new BluffList(
    lookupOneCached("#character-list__bluffs"),
    BluffDialog.create(lookupOneCached("#bluff-show"))
);

lookupCached(".js--character-list--bluff").forEach((button) => {

    button.addEventListener("click", ({ target }) => {

        const button = target.closest("button");

        if (!button) {
            return;
        }

        // bluffList.dataset.button = `#${identify(button)}`;
        bluffList.open(button);

    });

});

// lookupOneCached("#bluff-change").addEventListener("click", () => {
//
//     // show bluff list dialog.
//     //
//
// });

// delegate click events.

// const bluffListDialog = Dialog.create(bluffListWrapper);
// const bluffListDialog = Dialog.create(lookupOne("#bluff-list"));

// {% embed '../includes/dialog.twig' with {
//     id: 'bluff-show',
//     background: 'hide'
// } %}
//     {% block title %}<span id="bluff-show-name">Token</span>{% endblock %}
//     {% block body %}
//     <div id="bluff-show-token" class="character-show__token"></div>
//     <p id="bluff-show-ability" class="character-show__ability"></p>
//     <button type="button" class="no-btn button" id="bluff-change">Change token</button>
//     {% endblock %}
// {% endembed %}

// #bluff-change

//*
bluffList.addEventListener("click", ({ target }) => {

    const characterId = target.closest("[data-character-id]").dataset.characterId;
    const buttonSelector = bluffList.dataset.button;

    TokenStore.ready(({ characters }) => {

        const character = characters[characterId];

        if (!character) {
            return;
        }

        // bluffs.display(buttonSelector, character);
        // bluffListDialog.hide();
        bluffList.select(character);

    });

});
//*/

// Reset Buttons.

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".js--pad").style.height = "";
});

lookupOne("#clear-grimoire").addEventListener("click", ({ target }) => {

    if (window.confirm(target.dataset.confirm)) {

        pad.reset();
        bluffs.reset();

    }

});
