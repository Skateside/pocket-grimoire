import {
    empty,
    identify
} from "../utils/elements.js";

export default class Bluff {

    constructor(button) {

        this.button = button;
        this.character = null;

    }

    setObserver(observer) {
        this.observer = observer;
    }

    setCharacter(character) {
        this.character = character;
    }

    getCharacter() {
        return this.character;
    }

    hasCharacter() {
        return Boolean(this.character);
    }

    getSelector() {
        return `#${identify(this.button)}`;
    }

    display(character, triggerEvent = true) {

        this.setCharacter(character);
        empty(this.button).append(character.drawToken());

        if (triggerEvent) {

            this.observer.trigger("bluff", {
                button: this.getSelector(),
                character: character.getId()
            });

        }

    }

}
