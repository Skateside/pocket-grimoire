import Bluff from "../../classes/Bluff.js";
import Bluffs from "../../classes/Bluffs.js";
import BluffDialog from "../../classes/BluffDialog.js";
import BluffList from "../../classes/BluffList.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import Template from "../../classes/Template.js";
import Observer from "../../classes/Observer.js";
import {
    lookupCached,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

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

const bluffDialog = BluffDialog.create(lookupOne("#bluff-show"));

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

        lookupCached(".js--character-list--bluff").forEach((button) => {
            button.disabled = false;
        });

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

    TokenStore.ready(({ characters }) => {

        const character = characters[
            target.closest("[data-character-id]").dataset.characterId
        ];

        if (!character) {
            return;
        }

        bluffDialog.hide();
        bluffDialog.display(character);
        bluffList.select(character);
        bluffListDialog.hide();

    });

});
