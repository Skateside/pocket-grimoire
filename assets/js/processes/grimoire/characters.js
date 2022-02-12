import Dialog from "../../classes/Dialog.js";
import Observer from "../../classes/Observer.js";
import {
    empty,
    lookupOne,
    lookupCached,
    lookupOneCached
} from "../../utils/elements.js";

const tokenObserver = Observer.create("token");
const pad = lookupOneCached(".js--pad").pad;

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

function getToken(target) {
    return lookupOne(target.closest("[data-token]").dataset.token);
}

function hideDialog(target) {
    Dialog.create(target.closest(".dialog")).hide();
}

lookupOne("#character-shroud-toggle").addEventListener("click", ({ target }) => {

    pad.toggleDeadByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-rotate").addEventListener("click", ({ target }) => {

    pad.rotateByToken(getToken(target));
    hideDialog(target);

});

lookupOne("#character-remove").addEventListener("click", ({ target }) => {

    pad.removeCharacterByToken(getToken(target));
    hideDialog(target);

});
