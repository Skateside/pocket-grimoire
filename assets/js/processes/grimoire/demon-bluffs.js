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

});
