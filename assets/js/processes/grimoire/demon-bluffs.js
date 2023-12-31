import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import BluffDialog from "../../classes/BluffDialog.js";
import TokenDialog from "../../classes/TokenDialog.js";
import BluffsGroups from "../../classes/BluffsGroups.js";
import BluffsGroup from "../../classes/BluffsGroup.js";
import BluffSet from "../../classes/BluffSet.js";
import SettableTitle from "../../classes/SettableTitle.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const tokenDialog = TokenDialog.get();
const bluffDialog = BluffDialog.create(lookupOne("#bluff-show"));

BluffsGroup.setTemplate(Template.create(lookupOne("#demon-bluffs-template")));

TokenStore.ready((tokenStore) => {

    BluffSet.setEmptyCharacter(tokenStore.getEmptyCharacter());

    const bluffGroupsContainer = lookupOne("#demon-bluffs-group");
    // const bluffGroups = new BluffsGroups(bluffGroupsContainer);
    const bluffGroups = BluffsGroups.create(bluffGroupsContainer);
    bluffGroups.createEmptyGroup = () => new BluffsGroup(new BluffSet());
    bluffGroups.convertId = (id) => tokenStore.getCharacter(id);
    bluffGroups.announceUpdate = () => {

        tokenObserver.trigger("bluff", {
            data: bluffGroups.serialise()
        });

    };

    bluffGroupsContainer.addEventListener("click", ({ target }) => {

        const button = target.closest(".js--demon-bluffs--remove");
        const group = button?.closest(".js--demon-bluffs--group");

        if (!button || !group) {
            return;
        }

        bluffGroups.removeByIndex(group.dataset.groupId);

    });

    bluffGroupsContainer.addEventListener("click", ({ target }) => {

        const button = target.closest(".js--demon-bluffs--bluff[data-index]");

        if (!button) {
            return;
        }

        bluffGroups.setInnerIndex(button.dataset.index);
        bluffDialog.display(bluffGroups.getVisibleGroup().getCharacter());

    });

    bluffGroupsContainer.addEventListener(BluffsGroups.VISIBLE, ({ target }) => {
        bluffGroups.setVisibleGroupIndex(target.dataset.groupId);
    });

    bluffGroupsContainer.addEventListener(BluffsGroup.READY, ({ detail }) => {

        const {
            bluffGroup
        } = detail;
        const element = bluffGroup.getElement();

        lookup("[data-bluff-dialog]", element).forEach((trigger) => {
            trigger.dialog = BluffDialog.createFromTrigger(trigger);
        });

        const settableTitle = new SettableTitle(
            element.querySelector(".js--settable-title--title"),
            element.querySelector(".js--settable-title--input")
        );
        settableTitle.announceUpdate = () => bluffGroups.announceUpdate();
        bluffGroup.setSettableTitle(settableTitle);

    });

    bluffGroups.disableAnnouncements();
    bluffGroups.ready(BluffsGroups.getEmptyData());
    bluffGroups.enableAnnouncements();

    lookupOne("#add-bluffs").addEventListener("click", () => {
        bluffGroups.addEmpty();
    });

    gameObserver.on("characters-selected", ({ detail }) => {

        const characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );
        const characters = [
            tokenStore.characters[TokenStore.EMPTY],
            ...detail.characters
        ];

        replaceContentsMany(
            lookupOneCached("#character-list__bluffs"),
            characters.map((character) => characterTemplate.draw({
                ".js--character-list--item"(element) {

                    element.dataset.characterId = character.getId();
                    element.dataset.team = character.getTeam();

                },
                ".js--character-list--button"(element) {
                    element.dataset.tokenId = character.getId();
                },
                ".js--character-list--token"(element) {
                    element.append(character.drawToken());
                }
            }))
        );

    });

    // Show all possible bluffs dialog.

    function toggleBluffListClass(className, state) {

        lookupOneCached("#character-list__bluffs")
            .classList
            .toggle(className, state);

    }

    lookupOne("#show-existing").addEventListener("change", ({ target }) => {
        toggleBluffListClass("is-show-existing", target.checked);
    });

    lookupOne("#show-travellers").addEventListener("change", ({ target }) => {
        toggleBluffListClass("is-show-travellers", target.checked);
    });

    lookupOne("#show-evil").addEventListener("change", ({ target }) => {
        toggleBluffListClass("is-show-evil", target.checked);
    });

    const rolesInPlay = Object.create(null);

    tokenObserver.on("character-add", ({ detail }) => {

        const id = detail.character.getId();

        if (!rolesInPlay[id]) {
            rolesInPlay[id] = 0;
        }

        rolesInPlay[id] += 1;

    });

    tokenObserver.on("character-remove", ({ detail }) => {

        const id = detail.character.getId();

        if (rolesInPlay[id]) {
            rolesInPlay[id] -= 1;
        }

        if (!rolesInPlay[id] || rolesInPlay[id] < 0) {
            delete rolesInPlay[id];
        }

    });

    const bluffListDialog = Dialog.create(lookupOne("#bluff-list"));

    bluffListDialog.on(Dialog.SHOW, () => {

        Object
            .keys(rolesInPlay)
            .concat(bluffGroups.getVisibleGroup().serialise().set)
            .filter(Boolean) // remove any empty IDs
            .forEach((id) => {

                const token = lookupOne(
                    `#character-list__bluffs [data-character-id="${id}"]`
                );
                token?.classList.add("is-in-play");

            });

    });

    bluffListDialog.on(Dialog.HIDE, () => {

        lookup("#character-list__bluffs .is-in-play").forEach((token) => {
            token.classList.remove("is-in-play");
        });

    });

    lookupOne("#character-list__bluffs").addEventListener("click", ({ target }) => {

        const button = target.closest("[data-token-id]")

        if (!button) {
            return;
        }

        // assign the chosen character to the correct set
        const character = tokenStore.getCharacter(button.dataset.tokenId);
        bluffGroups.setCharacter(character);
        bluffGroups.redraw();
        // close the dialog
        bluffListDialog.hide();
        bluffDialog.hide();

    });

    // Bluff token dialog.

    lookupOneCached(
        "#bluff-show-token",
        bluffDialog.getElement()
    ).addEventListener("click", ({ target }) => {

        const id = target.closest("[data-character-id]")?.dataset.characterId;

        if (!id) {
            return;
        }

        tokenDialog.setIds([id]);
        tokenDialog.show();
        bluffDialog.hide();

    });

    lookupOneCached("#show-all-bluffs").addEventListener("click", ({ target }) => {

        tokenDialog.setIds(bluffGroups.getVisibleGroup().serialise().set);
        tokenDialog.setMultipleTitle(target.dataset.title);
        tokenDialog.show();

    });

    gameObserver.on("clear", () => {

        bluffGroups.removeAll();
        bluffGroups.addEmpty();

    });

    /* TEMP */console.log("window.bluffGroups = %o\nwindow.tokenObserver = %o\nwindow.bluffDialog = %o", bluffGroups, tokenObserver, bluffDialog);window.bluffGroups = bluffGroups;window.tokenObserver = tokenObserver;window.bluffDialog = bluffDialog;/* TEMP */

});

// NEXT STEPS
//
// The TokenDialog class isn't using the SettableTitle class.
// There's no communal list of demon bluff names (needed?)
// The old Bluff* classes haven't been deleted.


/*
import Bluff from "../../classes/Bluff.js";
import Bluffs from "../../classes/Bluffs.js";
import BluffDialog from "../../classes/BluffDialog.js";
import BluffList from "../../classes/BluffList.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import Template from "../../classes/Template.js";
import Observer from "../../classes/Observer.js";
// import CharacterToken from "../../classes/CharacterToken.js";
import TokenDialog from "../../classes/TokenDialog.js";
import {
    lookup,
    lookupCached,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");
const tokenDialog = TokenDialog.get();

const bluffs = Bluffs.create(
    lookupCached(".js--character-list--bluff").map((button) => new Bluff(button)),
    tokenObserver
);

TokenStore.ready((tokenStore) => {

    const noCharacter = tokenStore.getEmptyCharacter();

    bluffs.setNoCharacter(noCharacter);
    bluffs.reset(false);

});

lookupCached("[data-bluff-dialog]").forEach((trigger) => {
    trigger.dialog = BluffDialog.createFromTrigger(trigger);
});

const bluffDialog = BluffDialog.create(lookupOne("#bluff-show"));

TokenStore.ready((tokenStore) => {

    gameObserver.on("characters-selected", ({ detail }) => {

        const characterTemplate = Template.create(
            lookupOneCached("#character-list-template")
        );
        const characters = [
            tokenStore.characters[TokenStore.EMPTY],
            ...detail.characters
        ];

        replaceContentsMany(
            lookupOneCached("#character-list__bluffs"),
            characters.map((character) => characterTemplate.draw({
                ".js--character-list--item"(element) {

                    element.dataset.characterId = character.getId();
                    element.dataset.team = character.getTeam();

                },
                ".js--character-list--button"(element) {
                    element.dataset.tokenId = character.getId();
                },
                ".js--character-list--token"(element) {
                    element.append(character.drawToken());
                }
            }))
        );

        lookupCached(".js--character-list--bluff").forEach((button) => {
            button.disabled = false;
        });

    });

    function markInPlay(character, shouldAdd = true) {

        const inPlay = lookupOne(
            `#character-list__bluffs [data-character-id="${character.getId()}"]`
        );

        if (inPlay) {
            inPlay.classList.toggle("is-in-play", shouldAdd);
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

    tokenObserver.on("bluff", ({ detail }) => {

        const character = tokenStore.getCharacter(detail.character);

        if (character.getId()) {
            markInPlay(character);
        }

        const previous = tokenStore.getCharacter(detail.previous);

        if (previous && previous.getId() && !previous.isEmpty()) {
            markInPlay(previous, false);
        }

    });

    gameObserver.on("clear", () => {

        bluffs.reset();

        lookup("#character-list__bluffs .is-in-play").forEach((token) => {
            token.classList.remove("is-in-play");
        });

    });

    lookupOneCached(
        "#bluff-show-token",
        bluffDialog.getElement()
    ).addEventListener("click", ({ target }) => {

        const id = target.closest("[data-character-id]")?.dataset.characterId;

        if (!id) {
            return;
        }

        tokenDialog.setIds([id]);
        tokenDialog.show();
        bluffDialog.hide();

    });

    lookupOneCached("#show-all-bluffs").addEventListener("click", ({ target }) => {
        tokenDialog.setIds(bluffs.getIds());
        tokenDialog.setMultipleTitle(target.dataset.title);
        tokenDialog.show();
    });

});

function toggleBluffListClass(className, state) {

    lookupOneCached("#character-list__bluffs")
        .classList
        .toggle(className, state);

}

lookupOne("#show-existing").addEventListener("change", ({ target }) => {
    toggleBluffListClass("is-show-existing", target.checked);
});

lookupOne("#show-travellers").addEventListener("change", ({ target }) => {
    toggleBluffListClass("is-show-travellers", target.checked);
});

lookupOne("#show-evil").addEventListener("change", ({ target }) => {
    toggleBluffListClass("is-show-evil", target.checked);
});

const bluffList = new BluffList(
    BluffDialog.create(lookupOneCached("#bluff-show"))
);

lookupCached(".js--character-list--bluff").forEach((button) => {

    button.addEventListener("click", ({ target }) => {

        const button = target.closest("button");

        if (!button) {
            return;
        }

        bluffList.open(bluffs.getBluffByButton(button));

    });

});

const bluffListDialog = Dialog.create(lookupOne("#bluff-list"));

lookupOneCached("#character-list__bluffs").addEventListener("click", ({ target }) => {

    TokenStore.ready((tokenStore) => {

        const character = tokenStore.getCharacter(
            target.closest("[data-character-id]").dataset.characterId
        );

        if (!character) {
            return;
        }

        bluffDialog.hide();
        bluffDialog.display(character);
        bluffList.select(character);
        bluffListDialog.hide();

    });

});
*/
