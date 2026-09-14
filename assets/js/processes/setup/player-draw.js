import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import Template from "../../classes/Template.js";
import QRCode from "../../lib/qrcode-svg.js";
import {
    empty,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";
import {
    post
} from "../../utils/fetch.js";

const gameObserver = Observer.create("game");
const dialog = Dialog.create(lookupOneCached("#player-draw-qr-dialog"));
const characterSelectDialog = Dialog.create(lookupOneCached("#character-select"));
const slotTemplate = Template.create(lookupOneCached("#player-draw-slot-template"));
const qrButton = lookupOneCached("#player-select-qr");
const validationInput = lookupOneCached("#player-select-validation");
const copyButton = lookupOneCached("#player-draw-copy-link");

let activeSession = null;
let pollTimer = null;

function setLoading(state) {

    qrButton.disabled = state;
    qrButton.classList.toggle("is-loading", state);

    const progress = lookupOne("[role=\"progressbar\"]", qrButton);

    if (progress) {

        progress.setAttribute("aria-busy", state);
        progress.setAttribute("aria-valuenow", state ? "0" : "1");

    }

}

function showError(message) {

    validationInput.setCustomValidity(message);
    validationInput.form.reportValidity();
    window.setTimeout(() => {
        validationInput.setCustomValidity("");
    }, 0);

}

function createDrawKey(index) {
    return `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`;
}

function drawQRCode(url) {

    empty(lookupOneCached("#player-draw-qr")).append(QRCode({
        msg: url,
        ecl: "L"
    }));

    lookupOneCached("#player-draw-qr-link").href = url;
    copyButton.dataset.url = url;

}

function copyUsingSelection(value) {

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();

    const copied = document.execCommand("copy");
    input.remove();
    return copied;

}

function copyDrawUrl() {

    const url = copyButton.dataset.url;

    if (!url) {
        return Promise.resolve(false);
    }

    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(url)
            .then(() => true)
            .catch(() => copyUsingSelection(url));
    }

    return Promise.resolve(copyUsingSelection(url));

}

copyButton.addEventListener("click", () => {

    copyDrawUrl().then((copied) => {

        copyButton.textContent = (
            copied
            ? I18N.playerDrawLinkCopied
            : I18N.playerDrawCopyError
        );

        window.setTimeout(() => {
            copyButton.textContent = I18N.playerDrawCopyLink;
        }, 2500);

    });

});

function getSlotName(slot) {

    if (slot.name) {
        return slot.name;
    }

    return (
        slot.claimed
        ? I18N.playerDrawNoName
        : I18N.playerDrawWaiting
    );

}

function getSlotStatus(slot) {

    if (slot.submitted) {
        return I18N.playerDrawReady;
    }

    if (slot.name) {
        return I18N.playerDrawTyping;
    }

    if (slot.claimed) {
        return I18N.playerDrawClaimed;
    }

    return "";

}

function renderState(state) {

    lookupOneCached("#player-draw-submitted-count").textContent = state.submittedCount;
    lookupOneCached("#player-draw-total-count").textContent = state.total;

    replaceContentsMany(
        lookupOneCached("#player-draw-slots"),
        state.slots.map((slot) => slotTemplate.draw({
            ".js--player-draw--number"(element) {
                element.textContent = `#${slot.number}`;
            },
            ".js--player-draw--name"(element) {
                element.textContent = getSlotName(slot);
            },
            ".js--player-draw--status"(element) {
                element.textContent = getSlotStatus(slot);
            },
        }))
    );

}

function syncGrimoire(state) {

    const pad = lookupOneCached(".js--pad").pad;

    if (!pad) {
        return;
    }

    state.slots.forEach((slot) => {

        if (!slot.submitted || !slot.name) {
            return;
        }

        let character = activeSession.addedCharacters[slot.number];

        if (!character) {

            const selectedCharacter = activeSession.characters[slot.drawKey];

            if (!selectedCharacter) {
                return;
            }

            lookupOneCached("#grimoire").open = true;
            character = selectedCharacter.clone();
            activeSession.addedCharacters[slot.number] = character;
            pad.addNewCharacter(character);

        }

        pad.setPlayerName(character, slot.name);

    });

}

function stopPolling() {

    if (!pollTimer) {
        return;
    }

    clearInterval(pollTimer);
    pollTimer = null;

}

function pollState() {

    if (!activeSession) {
        return Promise.resolve();
    }

    return fetch(activeSession.stateUrl, {
        headers: {
            "Accept": "application/json"
        }
    })
        .then((response) => response.json())
        .then((state) => {

            if (!state.success) {
                stopPolling();
                return;
            }

            renderState(state);
            syncGrimoire(state);

            if (state.submittedCount >= state.total) {
                stopPolling();
            }

        })
        .catch(() => {});

}

function startPolling() {

    stopPolling();
    pollState();
    pollTimer = setInterval(pollState, 2000);

}

function createSession(characters, script) {

    const payload = characters.map((character, index) => ({
        drawKey: createDrawKey(index),
        character: character.getAllData()
    }));
    const characterMap = payload.reduce((map, entry, index) => {

        map[entry.drawKey] = characters[index];
        return map;

    }, Object.create(null));

    setLoading(true);
    validationInput.setCustomValidity("");

    return post(URLS.drawCreate, {
        characters: payload,
        sheet: {
            name: script?.name || "",
            game: script?.game || "",
            characters: (script?.characters || [])
                .filter((character) => [
                    "townsfolk",
                    "outsider",
                    "minion",
                    "demon"
                ].includes(character.getTeam()))
                .map((character) => character.getId())
        }
    })
        .then((state) => {

            setLoading(false);

            if (!state.success) {
                showError(state.message || I18N.playerDrawCreateError);
                return;
            }

            activeSession = {
                id: state.id,
                stateUrl: state.stateUrl,
                characters: characterMap,
                addedCharacters: Object.create(null)
            };

            drawQRCode(state.url);
            renderState(state);
            characterSelectDialog.hide();
            dialog.show();
            startPolling();

        })
        .catch(() => {
            setLoading(false);
            showError(I18N.playerDrawCreateError);
        });

}

gameObserver.on("player-draw-start", ({ detail }) => {

    if (qrButton.disabled) {
        return;
    }

    createSession(detail.characters, detail.script);

});
