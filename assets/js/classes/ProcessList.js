/**
 * A list of processes that can be executed.
 */
export default class ProcessList {

    constructor() {

        /**
         * A list of all the processes in the list.
         * @type {Array.<Object>}
         */
        this.list = [];

    }

    /**
     * Adds an item to {@link ProcessList#list}.
     *
     * @param {Object} item
     *        Item to add.
     */
    add(item) {
        this.list.push(item);
    }

    /**
     * Checks to see if the given item is already in {@link ProcessList#list}.
     *
     * @param  {Object} item
     *         Object to look for.
     * @return {Boolean}
     *         true if the item is already in the list, false otherwise.
     */
    has(item) {
        return this.list.includes(item);
    }

    /**
     * Adds an item to {@link ProcessList#list} but only if it's not already
     * there.
     *
     * @param {Object} item
     *        Item to add.
     */
    addUnique(item) {

        if (!this.has(item)) {
            this.add(item);
        }

    }

    /**
     * Removes an item from {@link ProcessList#list}. If the item is not in the
     * list then no action is taken.
     *
     * @param {Object} item
     *        Item to remove.
     */
    remove(item) {

        const index = this.list.indexOf(item);

        if (index > -1) {
            this.list.splice(index, 1);
        }

    }

    /**
     * Gets the last item from {@link ProcessList#list}. If there is nothing in
     * the list then undefined is returned.
     *
     * @return {Object|undefined}
     *         Either the last item in the list or undefined.
     */
    last() {
        return this.list[this.list.length - 1];
    }

    /**
     * Executes the given method on the given process. If the process doesn't
     * exist or the given method name isn't a function then no action is taken.
     *
     * @param {Object} process
     *        The process whose method should be executed.
     * @param {String} method
     *        The name of the method to execute.
     * @param {...?} args
     *        Arguments to pass to the method.
     */
    static execute(process, method, ...args) {

        if (typeof process?.[method] === "function") {
            process[method](...args);
        }

    }

}
