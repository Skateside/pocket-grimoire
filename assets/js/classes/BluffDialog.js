import Dialog from "./Dialog.js";
import {
    empty,
    lookupOneCached
} from "../utils/elements.js";

/**
 * A version of {@link Dialog} with extea abilities for displaying a token.
 */
export default class BluffDialog extends Dialog {

    /**
     * @inheritDoc
     */
    static createFromTrigger(trigger) {

        trigger.dataset.dialog = trigger.dataset.bluffDialog;
        super.createFromTrigger(trigger);

    }

    /**
     * Displays the given character within {@link BluffDialog#dialog}.
     *
     * @param {CharacterToken} character
     *        Character to display.
     */
    display(character) {

        const {
            dialog
        } = this;

        lookupOneCached(
            "#bluff-show-name",
            dialog
        ).textContent = character.getName();
        lookupOneCached(
            "#bluff-show-ability",
            dialog
        ).textContent = character.getAbility();
        empty(lookupOneCached("#bluff-show-token", dialog)).append(
            character.drawToken()
        );

    }

}
