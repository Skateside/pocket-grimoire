import Token from "./Token.js";
import Template from "./Template.js";
import {
    identify,
    appendMany
} from "../utils/elements.js";

/**
 * A version of {@link Token} that handles character information.
 */
export default class CharacterToken extends Token {

    /**
     * Sets the templates that will be access when drawing views.
     *
     * @param {Object} templates
     *        A map of keys to {@link Template} instances.
     */
    static setTemplates(templates) {

        /**
         * The templates that all instances will access.
         * @type {Object}
         */
        this.templates = templates;

    }

    /**
     * @inheritDoc
     */
    processData(data) {

        // Provide some default values so that .get() methods don't worry about
        // missing data and instead worry about typos.

        return {
            id: "",
            name: "",
            edition: "",
            team: "",
            firstNight: 0,
            firstNightReminder: "",
            otherNight: 0,
            otherNightReminder: "",
            reminders: [],
            setup: false,
            ability: "",
            image: "",
            ...data
        };

    }

    /**
     * @inheritDoc
     */
    setup() {

        /**
         * A flag showing whether or not the character is dead.
         * @type {Boolean}
         */
        this.isDead = false;

        /**
         * A flag showing whether or not the character is upside down,
         * indicating that the character is the opposite alignment (or on the
         * evil team if it's a traveller).
         * @type {Boolean}
         */
        this.isUpsideDown = false;

        /**
         * A collection of all jinxes that affect this character.
         * @type {Object}
         */
        this.jinxes = Object.create(null);

        this.setReminders([]);

    }

    /**
     * Sets the reminders that this character has.
     *
     * @param {Array.<ReminderToken>} reminders
     *        Instances of {@link ReminderToken} for each of the reminders that
     *        this character has.
     */
    setReminders(reminders) {

        /**
         * Collection of all reminders that this character uses.
         * @type {Array.<ReminderToken>}
         */
        this.reminders = reminders;

    }

    /**
     * Gets the reminders that this character has. The returned array may be
     * empty if the character doesn't have any reminders.
     *
     * @return {Array.<ReminderToken>}
     *         All the reminders for this character.
     */
    getReminders() {
        return this.reminders;
    }

    /**
     * Toggles the dead state for this character. The state can be forced by
     * passing a boolean to this method.
     *
     * @param  {Boolean} [state]
     *         Optional state to set. If ommitted, the state is toggled.
     * @return {Boolean}
     *         The new state.
     */
    toggleDead(state) {

        if (state === undefined) {
            state = !this.isDead;
        }

        this.isDead = state;

        return this.getIsDead();

    }

    /**
     * Exposes {@link CharacterToken#isDead}.
     *
     * @return {Boolean}
     *         true if the character is dead, false otherwise.
     */
    getIsDead() {
        return Boolean(this.isDead);
    }

    /**
     * Toggles the upside-down state for this character. The state can be forced
     * by passing a boolean to this method.
     *
     * @param  {Boolean} [state]
     *         Optional state to set. If ommitted, the state is toggled.
     * @return {Boolean}
     *         The new state.
     */
    rotate(state) {

        if (state === undefined) {
            state = !this.isUpsideDown;
        }

        this.isUpsideDown = state;

        return this.getIsUpsideDown();

    }

    /**
     * Exposes {@link CharacterToken#isUpsideDown}.
     *
     * @return {Boolean}
     *         true if the character is upside-down, false otherwise.
     */
    getIsUpsideDown() {
        return Boolean(this.isUpsideDown);
    }

    /**
     * Adds a jinx to the character.
     *
     * @param {Object} jinx
     *        Information about the jinx.
     * @param {String} reason
     *        The reason for the jinx.
     * @param {CharacterToken} character
     *        The character that this character is jinxed with.
     */
    addJinx({
        reason,
        character
    }) {

        this.jinxes[character.getId()] = {
            reason,
            character,
            isActive: false
        };

    }

    /**
     * Activates the jinx for the given character.
     *
     * @param {CharacterToken} character
     *        The character that's jinxed with the current character and whose
     *        jinx should be activated.
     */
    activateJinx(character) {
        this.activateJinxById(character.getId());
    }

    /**
     * Activates the jinx for the given character ID.
     *
     * @param {String} id
     *        The ID of the character whose jinx should be activated.
     */
    activateJinxById(id) {

        const jinx = this.jinxes[id];

        if (jinx) {
            jinx.isActive = true;
        }

    }

    /**
     * Deactivates a jinx for the given character.
     *
     * @param {CharacterToken} character
     *        The character that's jinxed with the current character and whose
     *        jinx should be deactivated.
     */
    deactivateJinx(character) {
        this.deactivateJinxById(character.getId());
    }

    /**
     * Deactivates the jinx for the given character ID.
     *
     * @param {String} id
     *        The ID of the character whose jinx should be deactivated.
     */
    deactivateJinxById(id) {

        const jinx = this.jinxes[id];

        if (jinx) {
            jinx.isActive = false;
        }

    }

    /**
     * Deactivates all the jinxes for this character.
     */
    deactivateAllJinxes() {
        Object.keys(this.jinxes).forEach((id) => this.deactivateJinxById(id));
    }

    /**
     * Gets all the active jinxes for this character.
     *
     * @return {Array.<Object>}
     *         Gets information about all the active jinxes.
     */
    getActiveJinxes() {
        return Object.values(this.jinxes).filter(({ isActive }) => isActive);
    }

    /**
     * Draws the token that can be shown on the grimoire.
     *
     * @return {DocumentFragment}
     *         Populated token.
     */
    drawToken() {

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

    /**
     * Draws the character's icon, name, and ability for the "Select Characters"
     * dialog box.
     *
     * @return {DocumentFragment}
     *         Populated select entry.
     */
    drawSelect() {

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

    /**
     * Draws the entry in the Night Order lists for this token.
     *
     * @param  {Boolean} [isFirst=true]
     *         A flag for whether the entry should be for the first night (true)
     *         or other nights (false). Defaults to true.
     * @return {DocumentFragment}
     *         Populated night order entry.
     */
    drawNightOrder(isFirst = true) {

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

    /**
     * Draws the character's entry in the character sheet.
     *
     * @return {DocumentFragment}
     *         Populated sheet entry.
     */
    drawSheet() {

        const {
            name,
            image,
            ability
        } = this.data;
        const {
            sheet,
            jinx
        } = this.constructor.templates;

        return sheet.draw([
            [
                ".js--edition--name",
                name
            ],
            [
                ".js--edition--image",
                image,
                Template.setSrc
            ],
            [
                ".js--edition--ability",
                ability
            ],
            [
                ".js--edition--jinxes",
                this.getActiveJinxes().map(({
                    reason,
                    character
                }) => jinx.draw([
                    [
                        ".js--edition-jinx--image",
                        "",
                        (element) => {

                            element.src = character.getImage();
                            element.alt += character.getName();
                            element.title = reason;

                        }
                    ]
                ])),
                (element, content) => appendMany(element, content)
            ]
        ]);

    }

}
