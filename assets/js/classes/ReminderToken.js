import Token from "./Token.js";
import Template from "./Template.js";

/**
 * A version of {@link Token} for reminder tokens.
 * @extends Token
 */
export default class ReminderToken extends Token {

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

        return this.constructor.templates.token.draw([
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

    /**
     * Draws the reminder list item.
     *
     * @return {DocumentFragment}
     *         Populated reminder list item.
     */
    drawList() {

        const {
            id,
            isGlobal
        } = this.data;

        return this.constructor.templates.list.draw([
            [
                ".js--reminder-list--item,.js--reminder-list--button",
                id,
                (element, content) => element.dataset.reminderId = content
            ],
            [
                ".js--reminder-list--item",
                isGlobal,
                (element, content) => {
                    element.classList.toggle("is-global", content);
                }
            ],
            [
                ".js--reminder-list--button",
                this.drawToken(),
                Template.append
            ]
        ]);

    }


}
