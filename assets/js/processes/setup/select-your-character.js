import Observer from "../../classes/Observer.js";
import Dialog from "../../classes/Dialog.js";
import TokenStore from "../../classes/TokenStore.js";
import Template from "../../classes/Template.js";
import {
    empty,
    lookup,
    lookupOne,
    lookupOneCached,
    replaceContentsMany
} from "../../utils/elements.js";
import {
    shuffle
} from "../../utils/arrays.js";

const gameObserver = Observer.create("game");

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

function chooseCharacter(element, showDialog) {

    if (!element || element.disabled) {
        return;
    }

    TokenStore.ready((tokenStore) => {

        // Add a clone of the character so that duplicated characters are still
        // considered unique.

        gameObserver.trigger("character-drawn", {
            element,
            character: tokenStore.getCharacter(element.dataset.id).clone(),
            showDialog
        });

    });

}

lookupOneCached("#character-choice").addEventListener("click", ({ target }) => {

    const element = target.closest("[data-id]");
    chooseCharacter(element, true);

});

gameObserver.on("character-drawn", ({ detail }) => {
    detail.element.disabled = true;
});

gameObserver.on("character-drawn", ({ detail }) => {

    const {
        character,
        showDialog
    } = detail;

    if (!showDialog)
        return;

    empty(lookupOneCached("#character-decision-wrapper")).append(
        character.drawToken()
    );
    lookupOneCached("#character-decision-ability").textContent = (
        character.getAbility()
    );
    Dialog.create(lookupOneCached("#character-decision")).show();

});

lookupOne("#open-all-character-choices").addEventListener("click", ({ target }) => {
    
    lookup("button.character-choice", lookupOneCached("#character-choice")).forEach((element) => {
        chooseCharacter(element, false);
    });

});
