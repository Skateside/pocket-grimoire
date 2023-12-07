import CharacterToken from "./CharacterToken";
import Observer from "./Observer";

/**
 * Manages a Jinx.
 *
 * The comments in the code might use a few terms to describe a jinx. Here's a
 * glossary:
 *
 * Theoretical.
 * The jinx exists but isn't part of this script.
 * For example: the Cerenovus is jinxed with the Goblin. If the Cerenovus is on
 * the current script but the Goblin is not then the jinx is theoretical.
 *
 * Ready.
 * The jinx is on the script.
 * For example: the Chambermaid is jinxed with the Mathematician. If both
 * characters are on the script then the jinx is ready, but not necessarily
 * active.
 *
 * Active.
 * Both characters that form this jinx have been selected.
 * For example, the Butler is jinxed with the Cannibal. If both tokens are in
 * the grimoire then the jinx is active.
 *
 * Target.
 * The character that has the jinx.
 * For example: the Pit-Hag is jinxed with the Heretic. The Pit-Hag is the
 * target. On a character sheet, the target is the larger icon above the smaller
 * jinxes.
 *
 * Trick.
 * The character that is jinxed with the target.
 * For example: the Lycanthrope is jinxed with the Gambler. The Gambler is the
 * trick. On a character sheet, the trick is the smaller icon under the main
 * character.
 */
export default class Jinx {

    /**
     * @param {CharacterToken|undefined} trick
     *        The character that the source character will be jinxed with. If
     *        the jinx is between 2 homebrew characters and only one is defined
     *        in the data, `trick` may be undefined.
     * @param {String} reason
     *        The reason for the jinx.
     */
    constructor(trick, reason) {

        /**
         * The character that the source character is jinxed with.
         * @type {CharacterToken|undefined}
         */
        this.trick = trick;

        /**
         * The reason for the jinx.
         * @type {String}
         */
        this.reason = reason;

        /**
         * The state of this jinx.
         * @type {Object}
         */
        this.state = {
            ready: false,
            trick: false,
            target: false,
            active: false
        };

    }

    /**
     * Sets hte target of the jinx, which is to say the larger icon on the
     * character sheet.
     *
     * @param {CharacterToken} target
     *        The jinx target.
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Sets an observer which can trigger events as the state changes.
     *
     * @param {Observer} observer
     *        Observer that will dispatch events at key moments.
     */
    setObserver(observer) {
        this.observer = observer;
    }

    /**
     * Helper function for toggling a state from within {@link Jinx#state}.
     * Optionally the state can be forced. If the state is the same, no action
     * is taken. Don't call this method directly, use one of the helper
     * functions {@link Jinx#toggleReady}, {@link Jinx#toggleTrick}, or
     * {@link Jinx#toggleTarget}.
     *
     * @param  {String} name
     *         Name of the state to toggle.
     * @param  {Boolean} [forceState]
     *         The state to force. If ommitted, the state is simply toggled.
     * @return {Boolean}
     *         The new state.
     * @throws {ReferenceError}
     *         The name of the state must be recognised.
     */
    toggleState(name, forceState) {

        const {
            state
        } = this;

        if (!Object.prototype.hasOwnProperty.call(state, name)) {
            throw new ReferenceError(`Unrecognised state "${name}"`);
        }

        if (forceState === undefined) {
            forceState = !state[name];
        }

        if (forceState !== state[name]) {

            state[name] = forceState;

            this.observer?.trigger(`toggle-jinx-${name}`, {
                jinx: this,
                state: forceState
            });

        }

        return forceState;

    }

    /**
     * Toggles the ready state. A jinx is considered "ready" when it's on the
     * script, but not necessarily active. Optionally the state can be forced
     * with the same logic as {@link Jinx#toggleState}.
     *
     * @param {Boolean} [forceState]
     *        The optional state to force.
     */
    toggleReady(forceState) {

        if (this.toggleState("ready", forceState) === false) {
            this.toggleState("active", false);
        }

    }

    /**
     * Exposes whether or not this jinx is ready.
     *
     * @return {Boolean}
     *         true if the jinx is ready, false otherwise.
     */
    isReady() {
        return this.state.ready;
    }

    /**
     * Activates the jinx by making sure that both the "ready" and "active"
     * states are set.
     */
    activate() {

        this.toggleReady(true);
        this.toggleState("active", true);

    }

    /**
     * Toggles the trick state. The jinx's trick is the character that the
     * target is jinxed with (the smaller icon on the character sheet). If the
     * trick state is true then that character has been selected for the game.
     * If the trick and target states are both active, the jinx will be
     * activated. Optionally the trick's state can be forced with the same logic
     * as {@link Jinx#toggleState}.
     *
     * @param {Boolean} [forceState]
     *        The optional state to force.
     */
    toggleTrick(forceState) {

        if (
            this.toggleState("trick", forceState)
            && this.state.target
        ) {
            this.activate();
        } else {
            this.toggleState("active", false);
        }

    }

    /**
    * Toggles the target state. The jinx's target is the character that the
    * target has the jinx (the larger icon on the character sheet). If the
    * target state is true then that character has been selected for the game.
    * If the trick and target states are both active, the jinx will be
    * activated. Optionally the target's state can be forced with the same logic
    * as {@link Jinx#toggleState}.
     *
     * @param {Boolean} [forceState]
     *        The optional state to force.
     */
    toggleTarget(forceState) {

        if (
            this.toggleState("target", forceState)
            && this.state.trick
        ) {
            this.activate();
        } else {
            this.toggleState("active", false);
        }

    }

    /**
     * Exposes whether or not this jinx is active.
     *
     * @return {Boolean}
     *         true if the jinx is active, false otherwise.
     */
    isActive() {
        return Boolean(this.trick) && this.state.ready && this.state.active;
        // return this.isReady() && this.state.trick && this.state.target;
    }

    /**
     * Checks to see if {@link Jinx#trick} matches the given character.
     *
     * @param  {CharacterToken} character
     *         Character to test for.
     * @return {Boolean}
     *         true if the character matches, false if it doesn't.
     */
    matches(character) {
        return Boolean(this.trick) && this.trick.matches(character);
    }

    /**
     * Exposes {@link Jinx#target}.
     *
     * @return {CharacterToken}
     *         The target character for the jinx.
     */
    getTarget() {
        return this.target;
    }

    /**
     * Exposes {@link Jinx#trick}.
     *
     * @return {CharacterToken|undefined}
     *         The character that the source character is jinxed with, if we
     *         know it.
     */
    getTrick() {
        return this.trick;
    }

    /**
     * Exposes {@link Jinx#reason}
     *
     * @return {String}
     *         The reason for the jinx.
     */
    getReason() {
        return this.reason;
    }

    /**
     * Exposes {@link Jinx#isHomebrew}
     *
     * @returns {Boolean}
     *          true if the Jinx is homebrew, false if it's not.
     */
    getIsHomebrew() {
        return Boolean(this.isHomebrew);
    }

    /**
     * Sets whether or not this Jinx is from a homebrew role.
     *
     * @param {Boolean} isHomebrew
     *        true if the Jinx comes from a homebrew source, false otherwise.
     */
    setIsHomebrew(isHomebrew) {

        /**
         * Whether or not this Jinx has ceom from a homebrew role or not.
         * @type {Boolean}
         */
        this.isHomebrew = isHomebrew;

    }

    /**
     * Sets the template that can be used to draw the jinx.
     *
     * @param {Template} template
     *        The template that will draw the jinx.
     */
    setTemplate(template) {

        /**
         * The template to draw the jinx.
         * @type {Template}
         */
        this.template = template;

    }

    /**
     * Helper function for drawing the jinx character icon.
     *
     * @param {Element} element
     *        Image element to modify.
     * @param {CharacterToken} character
     *        Character whose data should be sued to populate the image.
     */
    static drawImg(element, character) {

        if (!character) {
            return;
        }

        element.src = character.getImage();
        element.alt = character.getName();
        element.title = character.getName();

    }

    /**
     * Gets an ID for the jinx.
     *
     * @return {String}
     *         An ID for the jinx.
     */
    getId() {
        return `jinx--${this.target.getId()}-${this.trick?.getId() || '_unknown_'}`;
    }

    /**
     * Draws the jinx.
     *
     * @return {DocumentFragment}
     *         The jinx markup.
     */
    draw() {

        const {
            target,
            trick,
            reason,
            template,
            constructor: {
                drawImg
            }
        } = this;

        // if (!template) {
        //     throw new Error("Jinx template has not been set.");
        // }

        return template.draw({
            ".js--jinx-table--jinx": (element) => {
                element.id = this.getId();
            },
            ".js--jinx-table--target"(element) {
                drawImg(element, target);
            },
            ".js--jinx-table--target-name"(element) {
                element.textContent = target.getName();
            },
            ".js--jinx-table--trick"(element) {
                drawImg(element, trick);
            },
            ".js--jinx-table--trick-name"(element) {
                element.textContent = trick?.getName() || '';
            },
            ".js--jinx-table--reason"(element) {
                element.textContent = reason;
            }
        });

    }

}
