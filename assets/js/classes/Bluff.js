import {
    empty,
    identify
} from "../utils/elements.js";

export default class Bluff {

    constructor(button) {
        this.button = button;
    }

    setObserver(observer) {
        this.observer = observer;
    }

    getSelector() {
        return `#${identify(this.button)}`;
    }

    display(character, triggerEvent = true) {

        empty(this.button).append(character.drawToken());

        if (triggerEvent) {

            this.observer.trigger("bluff", {
                button: this.getSelector(),
                character: character.getId()
            });

        }

    }

}
