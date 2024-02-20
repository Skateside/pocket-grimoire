import BluffsGroup from "./BluffsGroup";
import CharacterToken from "./CharacterToken";
import {
    deepClone
} from "../utils/objects";

/**
 * The top-down controller for all groups of demon bluffs.
 */
export default class BluffsGroups {

    /**
     * The name of an event that's triggered on each group when they become
     * visible. We use this to work out {@link BluffsGroups#visibleGroupIndex}.
     * @type {String}
     */
    static get VISIBLE() {
        return "bluff-group-visible";
    }

    /**
     * Returns a copy of the empty data.
     *
     * @return {Object}
     *         A copy of the empty data.
     */
    static getEmptyData() {
        return deepClone({ index: 0, groups: [{ set: [] }] });
    }

    /**
     * Exposes {@link BluffsGroups.instance}.
     *
     * @return {BluffsGroups}
     *         The singleton instance.
     */
    static get() {
        return this.instance;
    }

    /**
     * Helper function for creating a new instance and storing it in
     * {@link BluffsGroups.instance}.
     *
     * @param  {HTMLElement} container
     *         The element that contains all Demon Bluffs groups.
     * @return {BluffsGroups}
     *         Instance.
     */
    static create(...args) {

        let bluffs = this.instance;

        if (!bluffs) {

            bluffs = new this(...args);

            /**
             * An instance that was created using {@link BluffsGroups.create}
             * and can be accessed using {@link BluffsGroups.get}.
             * @type {BluffsGroups}
             */
            this.instance = bluffs;

        }

        return bluffs;

    }

    /**
     * Sets up the class.
     *
     * @param {HTMLElement} container
     *        The element that contains all Demon Bluffs groups.
     */
    constructor(container) {

        /**
         * A collection of all the groups of Demon Bluffs.
         * @type {BluffsGroup[]}
         */
        this.groups = [];

        /**
         * The element that contains all Demon Bluffs elements.
         * @type {HTMLElement}
         */
        this.container = container;

        /**
         * The index of the group within {@link BluffsGroups#groups} of the
         * currently visible group.
         * @type {Number}
         */
        this.visibleGroupIndex = 0;

        /**
         * A flag that allows updates to be announced - if this setting is
         * `true` then updates are announced, if `false` then they're not.
         * @type {Boolean}
         */
        this.announceUpdates = true;

        /**
         * An observer that checks to see when a group of Demon Bluffs becomes
         * visible and triggers an event, which we can listen to in order to set
         * {@link BluffsGroups#visibleGroupIndex}.
         * @type {IntersectionObserver}
         */
        this.observer = new IntersectionObserver((entries) => {

            entries.forEach(({ target, intersectionRatio }) => {

                if (intersectionRatio >= 0.9) {

                    target.dispatchEvent(
                        new CustomEvent(this.constructor.VISIBLE, {
                            bubbles: true,
                            cancelable: false
                        })
                    );

                }

            });

        }, {
            root: container,
            threshold: [0.9, 0.95, 1]
        });

    }

    /**
     * A function that creates an empty group. This starts as an empty function
     * to keep the various classes loosely coupled.
     */
    createEmptyGroup() {
        return;
    }

    /**
     * Creates an empty group and passes it to {@link BluffsGroups#add}.
     */
    addEmpty() {
        this.add(this.createEmptyGroup());
    }

    /**
     * Adds a group to {@link BluffsGroups#groups} and sets it up correctly. If
     * the group already exists, no action is taken. Since a change has taken
     * place, the update is announced using
     * {@link BluffsGroups#maybeAnnounceUpdate}.
     *
     * @param  {BluffsGroup} group
     *         The group to add.
     * @throws {Error}
     *         `group` cannot be `null` or `undefined` (which it would be if
     *         {@link BluffsGroups#createEmptyGroup} hasn't been replaced).
     */
    add(group) {

        if (!group) {
            throw new Error("Cannot add a non-existent group");
        }

        if (this.has(group)) {
            return;
        }

        group.setIndex(this.groups.push(group) - 1);
        this.container.append(group.draw());
        group.setElement(this.container.querySelector(group.getSelector()));
        this.observer.observe(group.getElement());
        group.ready();
        this.maybeAnnounceUpdate();

    }

    /**
     * Checks to see if the given group is within {@link BluffsGroups#groups}.
     *
     * @param  {BluffsGroup} group
     *         Group to check for.
     * @return {Boolean}
     *         `true` if the group already exists, `false` otherwise.
     */
    has(group) {
        return this.groups.includes(group);
    }

    /**
     * Gets the index of the given group from within
     * {@link BluffsGroups#groups}.
     *
     * @param  {BluffsGroup} group
     *         Group whose index should be returned.
     * @return {Number}
     *         The index of the group or -1 if the group cannot be found.
     */
    getIndex(group) {
        return this.groups.indexOf(group);
    }

    /**
     * Removes the given group from {@link BluffsGroups#groups}. This function
     * works by passing the results of {@link BluffsGroups#getIndex} to
     * {@link BluffsGroups#removeByIndex}.
     *
     * @param {BluffGroup} group
     *        Group to remove.
     */
    remove(group) {
        this.removeByIndex(this.getIndex(group));
    }

    /**
     * Removes the group from {@link BluffsGroups#groups} that's at the given
     * index. Some validation is done to make sure that the given index is a
     * number between 0 and the number of groups - no action is taken if the
     * index fails these tests.
     *
     * @param {Number} index
     *        Index of the group to remove.
     */
    removeByIndex(index) {

        const {
            groups
        } = this;

        index = Number(index);

        if (index < 0 || index >= groups.length) {
            return;
        }

        const group = groups[index];

        this.observer.unobserve(group.getElement());
        group.remove();
        groups.splice(index, 1);
        this.updateIndicies();
        this.maybeAnnounceUpdate();

    }

    /**
     * Loops over all the groups within {@link BluffsGroups#groups} and removes
     * them all. It does this by passing each index to
     * {@link BluffsGroups#removeByIndex}.
     */
    removeAll() {

        const {
            groups
        } = this;
        let {
            length
        } = groups;

        while (length) {

            length -= 1;
            this.removeByIndex(length);

        }

    }

    /**
     * Updates all the indicies of the groups within {@link BluffsGroups#groups}
     * so that they match the array itself.
     */
    updateIndicies() {
        this.groups.forEach((group, index) => group.setIndex(index));
    }

    /**
     * Exposes {@link BluffsGroups#visibleGroupIndex}.
     *
     * @returns {Number}
     */
    getVisibleGroupIndex() {
        return this.visibleGroupIndex;
    }

    /**
     * Sets {@link BluffsGroups#visibleGroupIndex}. Some validation is done to
     * make sure that the given index is a number between 0 and the number of
     * groups - an error is thrown if this isn't the case. Because this has
     * updated the data, the update is announced using
     * {@link BluffsGroups#maybeAnnounceUpdate}.
     *
     * @param  {Number} index
     *         Index of the visible group.
     * @throws {RangeError}
     *         `index` must be a number between 0 and the number of groups.
     */
    setVisibleGroupIndex(index) {

        index = Number(index);

        if (index < 0 || index > this.groups.length) {
            throw new RangeError(`Visible index ${index} is out of range`);
        }

        this.visibleGroupIndex = index;
        this.maybeAnnounceUpdate();

    }

    /**
     * Gets the visible group - it does this by getting the item in
     * {@link BluffsGroups#groups} at {@link BluffsGroups#visibleGroupIndex}. If
     * a group can't be found at that location, an error is thrown.
     *
     * @return {BluffsGroup}
     *         The currently visible group of Demon Bluffs.
     * @throws {Error}
     *         A visible group must exist.
     */
    getVisibleGroup() {

        const group = this.groups[this.visibleGroupIndex];

        if (!group) {
            throw new Error(`Cannot find group at index ${this.visibleGroupIndex}`);
        }

        return group;

    }

    /**
     * The inner index is the index of the Demon Bluff within the currently
     * visible group of Demon Bluffs. This function sets it.
     *
     * @param {Number} index
     *        Inner index to set.
     */
    setInnerIndex(index) {
        this.getVisibleGroup().setSetIndex(index);
    }

    /**
     * The inner index is the index of the Demon Bluff within the currently
     * visible group of Demon Bluffs. This function gets it.
     *
     * @return {Number}
     *         Inner index.
     */
    getInnerIndex() {
        return this.getVisibleGroup().getSetIndex();
    }

    /**
     * Sets the character for the Demon Bluff of the currently visible group of
     * bluffs. Because a change will have happened, the update is announced
     * using {@link BluffsGroups#maybeAnnounceUpdate}.
     *
     * @param {CharacterToken} character
     *        The character to set.
     */
    setCharacter(character) {

        this.getVisibleGroup().setCharacter(character);
        this.maybeAnnounceUpdate();

    }

    /**
     * Redraws the currently visible group of demon bluffs, updating the buttons
     * to reflect the current state.
     */
    redraw() {
        this.getVisibleGroup().redrawButton();
    }

    /**
     * Gets an object reflecting the current state of the demon bluffs. It does
     * this by calling {@link BluffsGroup#serialise} on all groups within
     * {@link BluffsGroups#groups}.
     *
     * @returns {Object}
     *          Serialised state of the Demon Bluffs.
     */
    serialise() {

        return {
            index: this.visibleGroupIndex,
            groups: this.groups.map((group) => group.serialise())
        };

    }

    /**
     * Disables the update announcements.
     */
    disableAnnouncements() {
        this.announceUpdates = false;
    }

    /**
     * Enables the update announcements.
     */
    enableAnnouncements() {
        this.announceUpdates = true;
    }

    /**
     * Checks {@link BluffsGroups.announceUpdates} to see if updates should be
     * announced, doing nothing if they shouldn't.
     */
    maybeAnnounceUpdate() {

        if (!this.announceUpdates) {
            return;
        }

        this.announceUpdate();

    }

    /**
     * A function that executes when an update should be announced. This is done
     * to keep the classes loosely coupled.
     */
    announceUpdate() {
        return;
    }

    /**
     * Takes the character ID and converts it into a {@link CharacterToken}.
     * This function starts as an empty function so that it can be replaced and
     * still keep the classes loosely coupled.
     *
     * @param  {String} id
     *         The ID of the character whose token should be returned.
     * @return {CharacterToken}
     *         The character token instance for the given ID.
     */
    convertId(id) {
        return;
    }

    /**
     * A function that executes when the class is ready, creating the groups
     * defined in {@link BluffsGroups.readyData}.
     */
    ready({ index, groups }) {

        this.removeAll();

        groups.forEach(({ name, set }) => {

            const group = this.createEmptyGroup();

            if (!group) {
                throw new Error("Cannot create an empty group");
            }

            group.setTitle(name);
            set.forEach((id, index) => {
                group.setCharacter(this.convertId(id), index);
            });

            this.add(group);

        });

        this.setVisibleGroupIndex(index);
        this.getVisibleGroup().display();

    }

}
