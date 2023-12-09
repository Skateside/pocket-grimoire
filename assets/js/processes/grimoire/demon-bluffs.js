import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import Observer from "../../classes/Observer.js";
import BluffDialog from "../../classes/BluffDialog.js";
import {
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany,
    empty
} from "../../utils/elements.js";

class BluffsGroups {

    static get VISIBLE() {
        return "bluff-group-visible";
    }

    constructor(container) {

        this.groups = [];
        this.container = container;
        this.visibleGroupIndex = -1;

        this.observer = new IntersectionObserver((entries) => {

            entries.forEach(({ target, intersectionRatio }) => {

                if (intersectionRatio === 1) {

                    target.dispatchEvent(
                        new CustomEvent(this.constructor.VISIBLE, {
                            bubbles: true,
                            cancelable: false
                        })
                    );

                }

            });

        }, {
            root: container,
            threshold: 1
        });

    }

    add(group) {

        if (this.has(group)) {
            return;
        }

        group.setIndex(this.groups.push(group) - 1);
        this.container.append(group.draw());
        group.setElement(this.container.querySelector(group.getSelector()));
        this.observer.observe(group.getElement());
        group.ready();

    }

    has(group) {
        return this.groups.includes(group);
    }

    getIndex(group) {
        return this.groups.indexOf(group);
    }

    remove(group) {
        this.removeByIndex(this.getIndex(group));
    }

    removeByIndex(index) {

        const {
            groups
        } = this;

        index = Number(index);

        if (index < 0 || index >= groups.length) {
            return;
        }

        const group = groups[index];

        this.observer.unobserve(group.getElement());
        group.remove();
        groups.splice(index, 1);
        this.updateIndicies();

    }

    updateIndicies() {
        this.groups.forEach((group, index) => group.setIndex(index));
    }

    getVisibleGroupIndex() {
        return this.visibleGroupIndex;
    }

    setVisibleGroupIndex(index) {

        index = Number(index);

        if (index < 0 || index > this.groups.length) {
            throw new RangeError(`Visible index ${index} is out of range`);
        }

        this.visibleGroupIndex = index;

    }

    getVisibleGroup() {

        const group = this.groups[this.visibleGroupIndex];

        if (!group) {
            throw new Error(`Cannot find group at index ${this.visibleGroupIndex}`);
        }

        return group;

    }

    setInnerIndex(index) {
        this.getVisibleGroup().setSetIndex(index);
    }

    getInnerIndex() {
        return this.getVisibleGroup().getSetIndex();
    }

    setCharacter(character) {
        return this.getVisibleGroup().setCharacter(character);
    }

    redraw() {
        this.getVisibleGroup().redrawButton();
    }

    serialise() {
        return this.groups.map((group) => group.serialise());
    }

}

class BluffsGroup {

    static get READY() {
        return "bluff-group-ready";
    }

    static setTemplate(template) {
        this.template = template;
    }

    constructor(bluffSet) {

        this.index = 0;
        this.bluffSet = bluffSet;

    }

    setElement(element) {
        this.element = element;
    }

    getElement() {
        return this.element;
    }

    setIndex(index) {

        this.index = index;

        if (this.element) {
            this.element.dataset.groupId = this.index;
        }

    }

    serialise() {
        // TODO: give this bluff group a name and return that as well
        // { name: "lorem ipsum", set: this.bluffSet.serialise() }
        return this.bluffSet.serialise();
    }

    draw() {

        return this.constructor.template.draw({
            ".js--demon-bluffs--group": (element) => {
                element.dataset.groupId = this.index;
            }
        })

    }

    getSelector() {
        return `.js--demon-bluffs--group[data-group-id="${this.index}"]`;
    }

    getSetIndex() {
        return this.bluffSet.getIndex();
    }

    setSetIndex(index) {
        return this.bluffSet.setIndex(index);
    }

    setCharacter(character) {
        this.bluffSet.setCharacter(character);
    }

    ready() {

        const {
            element,
            bluffSet,
            constructor: {
                READY
            }
        } = this;

        if (!element) {
            return;
        }

        element.scrollIntoView({
            block: "nearest"
        });

        bluffSet.getCharacters().forEach((character, index) => {

            const button = lookupOne(
                `.js--demon-bluffs--bluff[data-index="${index}"]`,
                element
            );

            empty(button).append(character.drawToken());

        });

        element.dispatchEvent(new CustomEvent(READY, {
            bubbles: true,
            cancelable: false,
            detail: {
                bluffGroup: this
            }
        }));

    }

    remove() {
        this.element?.remove();
    }

    redrawButton() {

        const {
            element,
            bluffSet
        } = this;

        const setIndex = bluffSet.getIndex();
        const character = bluffSet.getCharacters()[setIndex];

        empty(lookupOne(
            `.js--demon-bluffs--bluff[data-index="${setIndex}"]`,
            element
        )).append(character.drawToken());

    }

}

class BluffSet {

    static setEmptyCharacter(emptyCharacter) {
        this.emptyCharacter = emptyCharacter;
    }

    constructor() {

        const {
            emptyCharacter
        } = this.constructor;

        if (!emptyCharacter) {
            throw new Error("The \"No character\" character needs to be set.");
        }

        this.characters = [
            emptyCharacter.clone(),
            emptyCharacter.clone(),
            emptyCharacter.clone()
        ];

        this.index = 0;

    }

    getCharacters() {
        return [...this.characters];
    }

    validateIndex(index) {

        index = Number(index);

        if (index < 0 || index >= this.characters.length) {

            if (showThrow) {
                throw new RangeError(`Invalid index ${index}`)
            }

            return -1;

        }

        return index;

    }

    setCharacter(character, index = this.index) {
        this.characters[this.validateIndex(index)] = character;
    }

    unsetCharacter(character) {
        this.unsetCharacterByIndex(this.characters.indexOf(character));
    }

    unsetCharacterByIndex(index) {

        this.characters[this.validateIndex(index)] = (
            this.constructor.emptyCharacter.clone()
        );

    }

    setIndex(index) {
        this.index = this.validateIndex(index);
    }

    getIndex() {
        return this.index;
    }

    serialise() {
        return this.characters.map((character) => character.getId());
    }

}

BluffsGroup.setTemplate(
    Template.create(lookupOne("#demon-bluffs-template"))
);

TokenStore.ready((tokenStore) => {

    const gameObserver = Observer.create("game");
    const tokenObserver = Observer.create("token");

    BluffSet.setEmptyCharacter(tokenStore.getEmptyCharacter());

    const bluffGroupsContainer = lookupOne("#demon-bluffs-group");
    const bluffGroups = new BluffsGroups(bluffGroupsContainer);

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

    });

    bluffGroupsContainer.addEventListener(BluffsGroups.VISIBLE, ({ target }) => {
        bluffGroups.setVisibleGroupIndex(target.dataset.groupId);
    });

    bluffGroupsContainer.addEventListener(BluffsGroup.READY, ({ target }) => {

        lookup("[data-bluff-dialog]", target).forEach((trigger) => {
            trigger.dialog = BluffDialog.createFromTrigger(trigger);
        });

    });

    bluffGroups.add(new BluffsGroup(new BluffSet()));

    lookupOne("#add-bluffs").addEventListener("click", () => {
        bluffGroups.add(new BluffsGroup(new BluffSet()));
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

    // const bluffDialog = BluffDialog.create(lookupOne("#bluff-show"));

    // bluffDialog.on(BluffDialog.SHOW, (e) => {
    //     // TODO: How do I know which token is being shown right now?
    //     lookupOneCached("#bluff-show-token").disabled = true;
    //     console.log({ e });
    // });

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

    });

    /* TEMP */console.log("window.bluffGroups = %o", bluffGroups);window.bluffGroups = bluffGroups;/* TEMP */

});

// NEXT STEPS
//
// The bluffs can't be assigned yet.
//      -> choosing a bluff doesn't update the popup yet.
// The "Show all bluffs" button doesn't work.
// The store can't re-load the bluffs yet.
// Clearing the grimoire won't clear the bluffs.


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
