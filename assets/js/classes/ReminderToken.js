import Token from "./Token.js";
import Template from "./Template.js";

/**
 * A version of {@link Token} for reminder tokens.
 * @extends Token
 */
export default class ReminderToken extends Token {

    /**
     * Sets the template that all instances refer to.
     *
     * @param {Template} template
     *        Template instance.
     */
    static setTemplate(template) {

        /**
         * Instance of {@link Template} that all instances will use.
         * @type {Template}
         */
        this.template = template;

    }

    /**
     * A collection of all global reminders - reminders that aren't attached to
     * any character but might still be useful for play.
     * @type {Array.<ReminderToken>}
     */
    static global = [];

    /**
     * Adds a reminder to {@link ReminderToken.global}.
     *
     * @param {ReminderToken} reminder
     *        Global reminder to add.
     */
    static addGlobal(reminder) {
        this.global.push(reminder);
    }

    /**
     * Exposes {@link ReminderToken.global}.
     *
     * @return {Array.<ReminderToken>}
     *         All global reminders.
     */
    static getGlobal() {
        return this.global;
    }

    /**
     * @inheritDoc
     */
    processData(data) {

        // Provide some default values so that .get() methods don't worry about
        // missing data and instead worry about typos.

        return {
            id: "",
            text: "",
            image: "",
            characterId: "",
            characterName: "",
            isGlobal: false,
            ...data
        };

    }

    /**
     * Draws the reminder token.
     *
     * @return {DocumentFragment}
     *         Populated token.
     */
    drawToken() {

        const {
            image,
            text,
            characterName
        } = this.data;

        return this.constructor.template.draw([
            [
                ".js--reminder--name",
                characterName
            ],
            [
                ".js--reminder--text",
                text
            ],
            [
                ".js--reminder--image",
                image,
                Template.setSrc
            ]
        ]);

    }

}
