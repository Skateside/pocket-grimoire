import Observer from "./classes/Observer.js";
import Dialog from "./classes/Dialog.js";
import Tokens from "./classes/Tokens.js";
import {
    lookup,
    lookupOne,
    lookupCached,
    lookupOneCached,
    identify
} from "./utils/elements.js";
import {
    clamp
} from "./utils/numbers.js";
import {
    shuffle
} from "./utils/arrays.js";
import qrcode from "./lib/qrcode.js";


export default class Template {

    static cache = Object.create(null);

    static create(template) {

        const {
            cache
        } = this;
        const key = identify(template);

        if (!cache[key]) {
            cache[key] = new this(template);
        }

        return cache[key];

    }

    static setText(element, content) {
        element.textContent = content;
    }

    static setSrc(element, content) {
        element.src = content;
    }

    static append(element, content) {
        element.append(content);
    }

    constructor(template) {
        this.template = template;
    }

    draw(populates) {

        const clone = this.template.content.cloneNode(true);

        populates.forEach(([
            selector,
            content,
            populate
        ]) => this.populate(clone, selector, content, populate));

        return clone;

    }

    populate(
        clone,
        selector,
        content,
        populate = this.constructor.setText
    ) {

        lookupCached(selector, clone)
            .forEach((element) => populate(element, content));

    }

}


class Token {

    static convertProperty(property) {

        const clipped = property.replace(/^get/, "");

        return clipped.charAt(0).toLowerCase() + clipped.slice(1);

    }

    constructor(data) {

        this.data = data;

        const constructor = this.constructor;

        return new Proxy(this, {

            get(target, property) {

                if (!(property in target) && property.startsWith("get")) {

                    target[property] = () => target.getData(
                        constructor.convertProperty(property)
                    );

                }

                return target[property];

            }

        });

    }

    clone() {
        return new this.constructor(this.data);
    }

    getData(key) {

        if (!Object.prototype.hasOwnProperty.call(this.data, key)) {
            throw new ReferenceError(`Unrecognised property "${key}"`);
        }

        return this.data[key];

    }

}

class CharacterToken extends Token {

    static setTemplates(templates) {
        this.templates = templates;
    }

    setReminders(reminders) {
        this.reminders = reminders;
    }

    getReminders() {
        return this.reminders || [];
    }

    toggleDead(state) {

        if (state === undefined) {
            state = !this.isDead;
        }

        this.isDead = state;

        return this.getIsDead();

    }

    getIsDead() {
        return Boolean(this.isDead);
    }

    draw() {

        // #character-template

        const {
            name,
            image,
            reminders = [],
            remindersGlobal = [],
            firstNight,
            otherNight,
            setup
        } = this.data;

        return this.constructor.templates.token.draw([
            [
                ".js--character--leaves",
                "",
                (element) => {

                    element.classList.toggle("character--setup", setup);
                    element.classList.toggle("character--left-1", firstNight);
                    element.classList.toggle("character--right-1", otherNight);
                    const top = reminders.length + remindersGlobal.length;
                    element.classList.toggle(`character--top-${top}`, top);

                }
            ],
            [
                ".js--character--image",
                image,
                Template.setSrc
            ],
            [
                ".js--character--name",
                name
            ]
        ]);

    }

    drawSelect() {

        // #character-select-template

        const {
            id,
            name,
            image,
            ability,
            setup
        } = this.data;

        return this.constructor.templates.select.draw([
            [
                ".js--character-select--image",
                image,
                Template.setSrc
            ],
            [
                ".js--character-select--name",
                name,
                (element, content) => {

                    Template.setText(element, content);
                    element.classList.toggle("is-setup", setup);

                }
            ],
            [
                ".js--character-select--ability",
                ability
            ],
            [
                ".js--character-select--input",
                id,
                (element, content) => {

                    element.value = content;
                    element.closest("label").htmlFor = identify(element);

                }
            ]
        ]);

    }

    drawNightOrder(isFirst = true) {

        // #night-info-template

        const {
            id,
            name,
            image,
            firstNightReminder,
            otherNightReminder
        } = this.data;

        return this.constructor.templates.nightOrder.draw([
            [
                ".js--night-info--wrapper",
                id,
                (element, content) => element.dataset.id = content
            ],
            [
                ".js--night-info--icon",
                image,
                Template.setSrc
            ],
            [
                ".js--night-info--role",
                name
            ],
            [
                ".js--night-info--ability",
                (
                    isFirst
                    ? firstNightReminder
                    : otherNightReminder
                )
            ]
        ]);

    }

}


class ReminderToken extends Token {

    static setTemplate(template) {
        this.template = template;
    }

    draw() {

        const {
            image,
            text
        } = this.data;

        return this.constructor.template.draw([
            [
                ".js--reminder--text",
                text
            ],
            [
                ".js--reminder--image",
                image,
                Template.setSrc
            ]
        ]);

    }

}

// TokenStore

function defer() {

    let res = () => {};
    let rej = () => {};

    const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });

    promise.resolve = res;
    promise.reject = rej;

    return promise;

}

class TokenStore {

    static promise = defer();

    static create(data) {
        this.promise.resolve(new this(data));
    }

    static get() {
        return this.promise;
    }

    static ready(handler) {
        return this.get().then(handler);
    }

    constructor(data) {

        this.data = data;
        this.characters = Object.create(null);
        this.reminders = Object.create(null);

        data.forEach((datum) => this.createCharacter(datum));

    }

    createCharacter(data) {

        const {
            id,
            image,
            reminders = [],
            remindersGlobal = []
        } = data;
        const character = new CharacterToken(data);

        character.setReminders(
            reminders
                .concat(remindersGlobal)
                .map((text) => this.createReminder({
                    id,
                    image,
                    text
                }))
        );

        this.characters[id] = character;

        return character;

    }

    createReminder(data) {

        const {
            id,
            text,
            image
        } = data;
        const reminderId = `${id}: ${text}`;
        const reminder = new ReminderToken({
            text,
            image,
            id: reminderId,
            characterId: id
        });

        this.reminders[reminderId] = reminder;

        return reminder;

    }

    getCharacter(id) {

        const character = this.characters[id];

        if (!character) {
            throw new ReferenceError(`Unable to find "${id}" character`);
        }

        return character.clone();

    }

    getReminder(id) {

        const reminder = this.reminders[id];

        if (!reminder) {
            throw new ReferenceError(`Unable to find the "${id}" reminder`);
        }

        return reminder.clone();

    }

}

class Pad {

    static get OFFSET() {
        return 15;
    }

    constructor(element, observer) {

        this.element = element;
        this.observer = observer;
        this.tokens = new Tokens(element, observer);
        this.template = Template.create(lookupOne("#token-template"));

        this.characters = [];
        this.reminders = [];

    }

    addCharacter(character) {

        const {
            element,
            characters,
            observer,
            template
        } = this;

        element.append(
            template.draw([
                [
                    ".js--token--wrapper",
                    character.draw(),
                    Template.append
                ],
                [
                    ".js--token--wrapper",
                    "character",
                    (element, content) => element.dataset.token = content
                ]
            ])
        );

        const token = element.lastElementChild;
        const info = Object.freeze({
            character,
            token
        });

        characters.push(info);
        observer.trigger("character-add", info);

        return info;

    }

    addNewCharacter(character) {

        const {
            tokens,
            characters
        } = this;
        const {
            token
        } = this.addCharacter(character);
        const offset = this.constructor.OFFSET;

        tokens.moveTo(
            token,
            characters.length * offset,
            offset,
            tokens.advanceZIndex()
        );

    }

    removeCharacter(character) {

        const {
            characters,
            observer
        } = this;
        const index = characters
            .findIndex((info) => info.character === character);

        if (index < 0) {
            return;
        }

        const {
            token
        } = characters[index];

        token.remove();
        characters.splice(index, 1);
        observer.trigger("character-remove", {
            character,
            token
        });

    }

    getCharacterByToken(token) {
        return this.characters.find((info) => info.token === token)?.character;
    }

    removeCharacterByToken(token) {
        this.removeCharacter(this.getCharacterByToken(token));
    }

    toggleDead(character) {

        const {
            characters,
            observer
        } = this;
        const info = characters.find((info) => info.character === character);

        if (!info) {
            return;
        }

        const {
            token
        } = info;

        const isDead = character.toggleDead();
        lookupOneCached(".js--character--leaves", token)
            .classList
            .toggle("is-dead", isDead);
        observer.trigger("shroud-toggle", {
            isDead,
            token,
            character
        });

    }

    toggleDeadByToken(token) {
        this.toggleDead(this.getCharacterByToken(token));
    }

    addReminder(reminder) {

        const {
            element,
            reminders,
            observer,
            template
        } = this;

        element.append(
            template.draw([
                [
                    ".js--token--wrapper",
                    reminder.draw(),
                    Template.append
                ],
                [
                    ".js--token--wrapper",
                    "reminder",
                    (element, content) => element.dataset.token = content
                ]
            ])
        );

        const token = element.lastElementChild;
        const info = Object.freeze({
            reminder,
            token
        });

        reminders.push(info);
        observer.trigger("reminder-add", info);

        return info;

    }

    removeReminder(reminder) {

        const {
            reminders,
            observer
        } = this;
        const index = reminders.findIndex((info) => info.reminder === reminder);

        if (index < 0) {
            return;
        }

        const {
            token
        } = reminders[index];

        token.remove();
        reminders.splice(index, 1);
        observer.trigger("reminder-remove", {
            reminder,
            token
        });

    }

    getReminderByToken(token) {
        return this.reminders.find((info) => info.token === token)?.reminder;
    }

    removeReminderByToken(token) {
        this.removeReminder(this.getReminderByToken(token));
    }

    reset() {

        this.characters.forEach(({ character }) => {
            this.removeCharacter(character);
        });
        this.reminders.forEach(({ reminder }) => {
            this.removeReminder(reminder);
        });
        this.tokens.reset();

    }

}

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

function deepFreeze(object) {

    if (object && typeof object === "object") {
        Object.values(object).forEach((item) => deepFreeze(item));
    }

    return Object.freeze(object);

}

class Store {

    static cache = Object.create(null);

    static create(key) {

        const {
            cache
        } = this;

        if (!cache[key]) {
            cache[key] = new this(key);
        }

        return cache[key];

    }

    constructor(key) {

        this.key = key;

        this.read();

    }

    write() {
        window.localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    read() {

        this.data = JSON.parse(window.localStorage.getItem(this.key)) || {
            lookup: {},
            characters: {}
        };

    }

    get() {
        return deepFreeze(deepClone(this.data));
    }

    getLookup(url) {
        return this.data.lookup[url];
    }

    setLookup(url, results) {

        this.data.lookup[url] = results;
        this.write();

    }

    // setCharacters(characters) {
    //
    //     this.data.characters = characters;
    //     this.write();
    //
    // }
    //
    // updateTokenPosition(token, left, top) {
    //
    //     if (!this.tokens) {
    //         this.tokens = [];
    //     }
    //
    //     const index = this.tokens.indexOf(token) || this.tokens.length;
    //
    //     this.data.tokens[index] = [
    //         {
    //             type: "character|reminder",
    //             content: "?"
    //         },
    //         left,
    //         top
    //     ];
    //
    // }

}

function fetchFromStore(url, store) {

    const results = store.getLookup(url);

    if (results !== undefined) {
        return Promise.resolve(results);
    }

    return fetch(url)
        .then((response) => response.json())
        .then((json) => {

            store.setLookup(url, json);
            return json;

        });

}

function groupBy(array, getGroup) {

    return array.reduce((grouped, item) => {

        const group = getGroup(item);

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(item);

        return grouped;

    }, Object.create(null));

}

function appendMany(target, list) {

    target.append(
        list.reduce((fragment, item) => {

            fragment.append(item);
            return fragment;

        }, document.createDocumentFragment())
    );

    return target;

}

function empty(element) {
    element.innerHTML = "";
    return element;
}

function replaceContentsMany(target, list) {
    return appendMany(empty(target), list);
}

/* -------------------------------------------------------------------------- */

// General Setup.

const store = Store.create("pocket-grimoire");
const gameObserver = Observer.create("game");
const tokenObserver = Observer.create("token");

fetchFromStore("./assets/data/characters.json", store).then((characters) => {
    gameObserver.trigger("characters-loaded", { characters });
});

fetchFromStore("./assets/data/game.json", store).then((breakdown) => {
    gameObserver.trigger("team-breakdown-loaded", { breakdown });
});

CharacterToken.setTemplates({
    token: Template.create(lookupOne("#character-template")),
    select: Template.create(lookupOne("#character-select-template")),
    nightOrder: Template.create(lookupOne("#night-info-template"))
});
ReminderToken.setTemplate(
    Template.create(lookupOne("#reminder-template"))
);

gameObserver.on("characters-loaded", ({ detail }) => {
    TokenStore.create(detail.characters);
});

lookupCached("[data-dialog]").forEach((trigger) => {
    trigger.dialog = Dialog.createFromTrigger(trigger);
});

// TODO: load data from the store.

// "Select Edition" dialog.

lookupOneCached("#edition-list").addEventListener("click", ({ target }) => {

    const button = target.closest("[data-edition]");

    if (!button) {
        return;
    }

    const {
        edition
    } = button.dataset;
    const name = button.textContent.trim();

    TokenStore.ready(({ characters }) => {

        const filtered = Object
            .values(characters)
            .filter((character) => character.getEdition() === edition);

        gameObserver.trigger("characters-selected", {
            name,
            characters: filtered
        });
        Dialog.create(lookupOneCached("#edition-list")).hide();

    });

});

// "Select Characters" dialog.

function setTotals(breakdown) {

    Object.entries(breakdown).forEach(([team, count]) => {

        lookupCached(`[data-team="${team}"] .js--character-select--total`)
            .forEach((element) => {
                element.textContent = count;
            });

    });

}

function highlightRandomInTeam(team, count) {

    // Don't cache this since they will change if a different edition is chosen.
    const inputs = lookup(`[data-team="${team}"] [name="character"]`);

    if (!inputs.length) {
        return;
    }

    const chosen = shuffle(inputs).slice(0, count);

    inputs.forEach((input) => {

        const isChecked = input.checked;
        input.checked = chosen.includes(input);

        if (input.checked !== isChecked) {

            input.dispatchEvent(new Event("change", {
                bubbles: true
            }));

        }

    });

}

gameObserver.on("team-breakdown-loaded", ({ detail }) => {

    const playerCount = lookupOne("#player-count");
    const playerCountOutput = lookupOne("#player-count-output");

    playerCount.addEventListener("input", () => {
        playerCountOutput.value = playerCount.value;
    });

    function getBreakdown() {

        const {
            breakdown
        } = detail;

        return breakdown[clamp(0, playerCount.value - 5, breakdown.length - 1)];

    }

    playerCount.addEventListener("input", () => setTotals(getBreakdown()));
    setTotals(getBreakdown());

    lookupOne("#player-select-random").addEventListener("click", () => {

        Object.entries(getBreakdown()).forEach(([team, count]) => {
            highlightRandomInTeam(team, count);
        });

    });

});

gameObserver.on("characters-selected", ({ detail }) => {

    const teams = groupBy(
        detail.characters,
        (character) => character.getTeam()
    );

    lookupCached("[data-team]").forEach((wrapper) => {

        const team = wrapper.dataset.team;
        const isTeamPopulated = Array.isArray(teams[team]);
        wrapper.hidden = !isTeamPopulated;

        if (!isTeamPopulated) {
            return;
        }

        replaceContentsMany(
            lookupOneCached(".js--character-select--list", wrapper),
            teams[team].map((character) => character.drawSelect())
        );

    });

    lookupOneCached("#select-characters").disabled = false;

});

lookupCached("[data-team]").forEach((wrapper) => {

    wrapper.addEventListener("change", ({ target }) => {

        gameObserver.trigger("character-toggle", {
            element: target,
            id: target.value,
            active: target.checked
        });

    });

});

gameObserver.on("character-toggle", ({ detail }) => {

    const {
        element,
        active
    } = detail;

    const countElement = lookupOneCached(
        ".js--character-select--count",
        element.closest("[data-team]")
    );
    let count = Number(countElement.textContent) || 0;

    if (active) {
        count += 1;
    } else if (count > 0) {
        count -= 1;
    }

    countElement.textContent = count;

});

lookupOne("#player-select").addEventListener("submit", (e) => {

    e.preventDefault();

    const ids = lookup(":checked", e.target).map(({ value }) => value);

    TokenStore.ready(({ characters }) => {

        const filtered = Object
            .values(characters)
            .filter((character) => ids.includes(character.getId()));

        gameObserver.trigger("character-draw", {
            characters: filtered
        });

        Dialog.create(lookupOneCached("#character-select")).hide();

    });

});

// "Character Sheet" dialog.

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        name,
        characters
    } = detail;

    const url = new URL(window.location.href);
    const {
        pathname
    } = url;
    const page = pathname.slice(0, pathname.lastIndexOf("/") + 1);
    url.pathname = `${page}list.html`;

    if (name) {
        url.searchParams.append("name", name);
    }

    const ids = characters.map((character) => character.getId()).join(",");
    url.searchParams.append("characters", ids);

    const qr = new qrcode(0, "H");
    qr.addData(url.toString());
    qr.make();
    lookupOneCached("#qr-code").innerHTML = qr.createSvgTag({});
    lookupOneCached("#qr-code-button").disabled = false;
    lookupOneCached("#qr-code-link").href = url.toString();

});

// "Select Your Character" dialog.

gameObserver.on("character-draw", ({ detail }) => {

    const template = Template.create(
        lookupOneCached("#character-choice-template")
    );

    replaceContentsMany(
        lookupOneCached("#character-choice-wrapper"),
        shuffle(detail.characters)
            .map((character, i) => template.draw([
                [
                    "[data-id]",
                    character.getId(),
                    (element, content) => element.dataset.id = content
                ],
                [
                    ".js--character-choice--number",
                    i + 1
                ]
            ]))
    );

    Dialog.create(lookupOneCached("#character-choice")).show();

});

lookupOneCached("#character-choice").addEventListener("click", ({ target }) => {

    const element = target.closest("[data-id]");

    if (!element || element.disabled) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        gameObserver.trigger("character-drawn", {
            element,
            character: tokenStore.getCharacter(element.dataset.id)
        });

    });

});

gameObserver.on("character-drawn", ({ detail }) => {
    detail.element.disabled = true;
});

gameObserver.on("character-drawn", ({ detail }) => {

    // TODO: do something better.
    window.alert(`You are the ${detail.character.getName()}`);

});

// Grimoire.

const pad = new Pad(lookupOne(".pad"), tokenObserver);

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
                character.draw(),
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
                reminder.draw(),
                Template.append
            ]
        ]))
    );

});

// TODO: populate reminders in "Add reminder" dialog.

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

    empty(lookupOneCached("#character-show-token")).append(character.draw());
    lookupOneCached("#character-show-ability").textContent = character.getAbility();

    Dialog.create(dialog).show();

});

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(
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

tokenObserver.on("reminder-click", ({ detail }) => {
    pad.removeReminderByToken(detail.element);
});

lookupOne("#reset-height").addEventListener("click", () => {
    lookupOneCached(".pad").style.height = "";
});

lookupOne("#clear-grimoire").addEventListener("click", () => {

    if (window.confirm("Are you sure you want to clear all the tokens?")) {
        pad.reset();
    }

});

// Night Order.

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        characters
    } = detail;

    replaceContentsMany(
        lookupOneCached("#first-night"),
        characters
            .filter((character) => character.getFirstNight())
            .sort((a, b) => a.getFirstNight() - b.getFirstNight())
            .map((character) => character.drawNightOrder(true))
    );

    replaceContentsMany(
        lookupOneCached("#other-nights"),
        characters
            .filter((character) => character.getOtherNight())
            .sort((a, b) => a.getOtherNight() - b.getOtherNight())
            .map((character) => character.drawNightOrder(false))
    );

});

tokenObserver.on("character-add", ({ detail }) => {

    const id = detail.character.getId();

    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {

        firstNight.dataset.count = (Number(firstNight.dataset.count) || 0) + 1;
        firstNight.classList.add("is-playing");

    }

    if (otherNights) {

        otherNights.dataset.count = (Number(otherNights.dataset.count) || 0) + 1;
        otherNights.classList.add("is-playing");

    }

});

tokenObserver.on("character-remove", ({ detail }) => {

    const id = detail.character.getId();

    const firstNight = lookupOne(`#first-night [data-id="${id}"]`);
    const otherNights = lookupOne(`#other-nights [data-id="${id}"]`);

    if (firstNight) {

        const count = (Number(firstNight.dataset.count) || 1) - 1;
        firstNight.dataset.count = count;

        if (count === 0) {
            firstNight.classList.remove("is-playing");
        }

    }

    if (otherNights) {

        const count = (Number(otherNights.dataset.count) || 1) - 1;
        otherNights.dataset.count = count;

        if (count === 0) {
            otherNights.classList.remove("is-playing");
        }

    }

});
