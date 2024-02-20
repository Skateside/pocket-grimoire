import Dialog from "../../classes/Dialog.js";
import SelectDialog from "../../classes/SelectDialog.js";
import Observer from "../../classes/Observer.js";
import Pad from "../../classes/Pad.js";
import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import TokenDialog from "../../classes/TokenDialog.js";
import Names from "../../classes/Names.js";
import {
    identify,
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;
const recentReminders = lookupOneCached("#character-show-reminders");
const characterShowDialog = Dialog.create(lookupOneCached("#character-show"));
const tokenDialog = TokenDialog.get();
tokenDialog.setEntryTemplate(new Template(lookupOne("#token-entry-template")));

// Set up the token dialog when a character token is clicked.
tokenObserver.on("character-click", ({ detail }) => {

    const {
        element
    } = detail;
    const character = pad.getCharacterByToken(element);

    characterShowDialog.getElement().dataset.token = `#${identify(element)}`;
    lookupOneCached("#character-show-name").textContent = character.getName();
    lookupOneCached("#character-show-ability").textContent = character.getAbility();
    recentReminders.dataset.coords = JSON.stringify(pad.getTokenPosition(element));

    characterShowDialog.show();

});

// Update the recently-added-reminders list as a reminder is added.
tokenObserver.on("reminder-add", ({ detail }) => {

    const {
        reminder
    } = detail;
    const id = reminder.getId();
    const items = lookup(".js--reminder-list--item", recentReminders);

    const existing = items.find(({ dataset }) => dataset.reminderId === id);

    if (existing && existing === items[0]) {
        return;
    }

    if (items.length > 2 || (existing && existing !== items[0])) {
        (existing || items[items.length - 1]).remove();
    }

    recentReminders.prepend(reminder.drawList());

});

function getToken(target) {
    return lookupOne(target.closest("[data-token]").dataset.token);
}

function hideDialog(target) {
    Dialog.create(target.closest(".dialog")).hide();
}

TokenStore.ready(() => {

    // Show a token as it's clicked from the "show tokens" dialog.
    lookupOne("#character-show-token").addEventListener("click", ({ target }) => {

        tokenDialog.setIds([
            pad.getCharacterByToken(getToken(target)).getId()
        ]);
        tokenDialog.show();

        hideDialog(target);

    });

});

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-rotate").addEventListener("click", ({ target }) => {

    pad.rotateByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-reminder").addEventListener("click", ({ target }) => {

    const reminder = lookupOneCached("#reminder-list");
    const token = getToken(target);

    reminder.dataset.coords = JSON.stringify(pad.getTokenPosition(token));
    Dialog.create(reminder).show();
    hideDialog(target);

});

const characterListDialog = SelectDialog.get();
characterListDialog.addProcess({

    // The generic process: add a token to the pad when the icon is clicked.

    click(tokenId) {

        TokenStore.ready((tokenStore) => {
            pad.addCharacter(tokenStore.getCharacterClone(tokenId));
        });
        characterListDialog.hide();

    }

});

// The process that will replace one token in the grimoire with another one.
const replaceOnPadProcess = {

    data: null,

    click(tokenId) {

        TokenStore.ready((tokenStore) => {

            const {
                character,
                token: newToken
            } = pad.addCharacter(tokenStore.getCharacterClone(tokenId));
            const {
                data
            } = this;

            if (data) {

                const {
                    token,
                    coords: {
                        x,
                        y,
                        z
                    }
                } = data;

                const oldCharacter = pad.getCharacterByToken(lookupOne(token));
                pad.toggleDead(character, oldCharacter.getIsDead());
                pad.rotate(character, oldCharacter.getIsUpsideDown());
                pad.setPlayerName(character, pad.getPlayerName(oldCharacter));
                pad.removeCharacter(oldCharacter);
                pad.moveToken(newToken, x, y, z);

            }

        });

        characterListDialog.hide();

    },

    hide() {
        this.data = null;
        characterListDialog.removeProcess(replaceOnPadProcess);
    }

};

lookupOne("#character-replace").addEventListener("click", ({ target }) => {

    const token = getToken(target);
    replaceOnPadProcess.data = {
        coords: pad.getTokenPosition(token),
        token: `#${identify(token)}`
    };
    characterListDialog.addProcess(replaceOnPadProcess);
    characterListDialog.show();
    hideDialog(target);

});

// The process that will add another token to the token dialog.
const addToDialogProcess = {

    click(tokenId) {
        tokenDialog.addId(tokenId);
        tokenDialog.show();
        characterListDialog.hide();
    },

    hide() {
        characterListDialog.removeProcess(addToDialogProcess);
    }

};

lookupOne(".js--token--add").addEventListener("click", () => {
    characterListDialog.addProcess(addToDialogProcess);
    characterListDialog.show();
    tokenDialog.hide();
});

const characterNameInput = lookupOne("#character-name-input");
lookupOne("#character-name").addEventListener("click", ({ target }) => {

    const {
        value
    } = characterNameInput;
    const name = (value || "").trim();

    pad.setPlayerNameForToken(getToken(target), name);
    hideDialog(target);

});

const ghostVoteButton = lookupOneCached("#character-ghost-vote");

function setGhostButtonState(character) {

    ghostVoteButton.disabled = (
        ghostVoteButton,
        !character.getIsDead() || !character.getHasGhostVote()
    );

}

lookupOneCached("#character-show").addEventListener(Dialog.SHOW, ({ target }) => {

    const token = lookupOne(target.dataset.token);
    const character = pad.getCharacterByToken(token);

    setGhostButtonState(character);

});

ghostVoteButton.addEventListener("click", ({ target }) => {

    const token = getToken(target);
    pad.setGhostVoteForToken(token, false);

    const character = pad.getCharacterByToken(token);
    setGhostButtonState(character);

    hideDialog(target);

});

characterShowDialog.on(Dialog.SHOW, () => {

    const token = getToken(characterShowDialog.getElement());
    characterNameInput.value = pad.getPlayerNameForToken(token);

});

characterShowDialog.on(Dialog.HIDE, () => {
    characterNameInput.value = characterNameInput.defaultValue;
});

lookupOne("#character-remove").addEventListener("click", ({ target }) => {

    pad.removeCharacterByToken(getToken(target));
    hideDialog(target);

});

// Update the night order on the tokens.
// #72: Use objects rather than arrays to allow for decimals in night orders.
const nightOrder = {
    first: Object.create(null),
    other: Object.create(null)
};

function getSortedKeys(object) {
    return Object.keys(object).sort((a, b) => Number(a) - Number(b));
}

function assignCounts(object, dataKey) {

    let count = 0;

    getSortedKeys(object).forEach((key) => {

        const tokens = object[key];

        count += 1;

        tokens.forEach(({ token }) => {
            Pad.getToken(token).dataset[dataKey] = count;
        });

    });

}

function updateTokens() {

    assignCounts(nightOrder.first, "firstNight");
    assignCounts(nightOrder.other, "otherNight");

}

tokenObserver.on("character-add", ({ detail }) => {

    const {
        character,
        token
    } = detail;
    const {
        first,
        other
    } = nightOrder;

    const firstNight = character.getFirstNight();

    if (firstNight) {

        if (!first[firstNight]) {
            first[firstNight] = [];
        }

        first[firstNight].push({
            character,
            token
        });

    }

    const otherNight = character.getOtherNight();

    if (otherNight) {

        if (!other[otherNight]) {
            other[otherNight] = [];
        }

        other[otherNight].push({
            character,
            token
        });

    }

    updateTokens();

});

tokenObserver.on("character-remove", ({ detail }) => {

    const {
        character,
        token
    } = detail;
    const {
        first,
        other
    } = nightOrder;

    const firstNight = character.getFirstNight();
    const firstArray = first[firstNight];

    if (firstArray) {

        const index = firstArray.findIndex((info) => info.token === token);

        if (index > -1) {
            firstArray.splice(index, 1);
        }

        if (!firstArray.length) {
            delete first[firstNight];
        }

    }

    const otherNight = character.getOtherNight();
    const otherArray = other[otherNight];

    if (otherArray) {

        const index = otherArray.findIndex((info) => info.token === token);

        if (index > -1) {
            otherArray.splice(index, 1);
        }

        if (!otherArray.length) {
            delete other[otherNight];
        }

    }

    updateTokens();

});

// List of tokens.
// TODO: could we use character.drawList() here?

const tokenListTemplate = Template.create(lookupOne("#token-list-template"));
const tokenList = lookupOne("#token-list__list");

gameObserver.on("characters-selected", ({ detail }) => {

    const characters = detail.characters.filter((character) => {
        const team = character.getTeam();
        return team !== "traveller";
    });

    replaceContentsMany(
        tokenList,
        characters.map((character) => tokenListTemplate.draw({
            ".js--token-list--button"(element) {
                element.dataset.tokenId = character.getId();
            },
            ".js--token-list--token"(element) {
                element.append(character.drawToken());
            }
        }))
    );

});

TokenStore.ready((tokenStore) => {

    tokenDialog.setTokenStore(tokenStore);
    const tokenListDialog = Dialog.create(lookupOne("#token-list"));

    tokenList.addEventListener("click", ({ target }) => {

        const button = target.closest("[data-token-id]");

        if (!button) {
            return;
        }

        tokenDialog.setIds([button.dataset.tokenId]);
        tokenDialog.show();
        tokenListDialog.hide();

    });

});

// Update the list of suggested names that can be set when a token is drawn.

const names = Names.create();

names.on("names-added", () => {

    replaceContentsMany(
        lookupOneCached("#player-name-options"),
        names.drawList()
    );
    replaceContentsMany(
        lookupOneCached("#character-name-input-options"),
        names.drawList()
    );

});

names.on("names-cleared", () => {

    empty(lookupOneCached("#player-name-options"));
    empty(lookupOneCached("#character-name-input-options"));

});
