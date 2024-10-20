import Dialog from "./Dialog.js";
import CharacterToken from "./CharacterToken.js";
import {
    lookupOneCached
} from "../utils/elements.js";

/**
 * A version of {@link Dialog} with extra abilities for displaying a token.
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
     * @param {Boolean} isOrphan
     *        true if the "orphan" note should be shown, false otherwise.
     */
    display(character, isOrphan = false) {

        const {
            dialog
        } = this;
        const showTokenButton = lookupOneCached("#bluff-show-token", dialog);

        lookupOneCached(
            "#bluff-show-name",
            dialog
        ).textContent = character.getName();
        lookupOneCached(
            "#bluff-show-ability",
            dialog
        ).textContent = character.getAbility();
        lookupOneCached(
            "#bluff-show-orphan",
            dialog
        ).hidden = !isOrphan;
        showTokenButton.disabled = character.isEmpty();
        showTokenButton.dataset.characterId = character.getId();

    }

}
