// DEPRECATED
import Bluff from "./Bluff.js";
import BluffDialog from "./BluffDialog.js";
import CharacterToken from "./CharacterToken.js";

/**
 * Manages the list of bluffs, keeping a record of which bluff was selected.
 */
export default class BluffList {

    /**
     * Sets up the list.
     *
     * @param {BluffDialog} dialog
     *        Dialog that will display the token.
     */
    constructor(dialog) {

        /**
         * Dialog that will display the token.
         * @type {BluffDialog}
         */
        this.dialog = dialog;

    }

    /**
     * Opens {@link BluffList#dialog} and displays the given bluff's character.
     *
     * @param {Bluff} bluff
     *        Bluff whose character should be displayed.
     */
    open(bluff) {

        /**
         * The bluff that triggered the dialog.
         * @type {Bluff}
         */
        this.bluff = bluff;

        this.dialog.display(bluff.getCharacter());

    }

    /**
     * Sets the character for {@link BluffList#bluff}.
     *
     * @param {CharacterToken} character
     *        The character to set.
     */
    select(character) {
        this.bluff.display(character);
    }

}
