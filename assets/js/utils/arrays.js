/**
 * Creates an array that's a shuffled version of the given array. The original
 * array is not modified.
 * Schwartzian transform.
 *
 * @param  {Array} array
 *         Array to shuffle.
 * @return {Array}
 *         Shuffled array.
 */
export function shuffle(array) {

    const numbers = window.crypto.getRandomValues(
        new Uint16Array(array.length)
    );

    return Array.from(array, (value, i) => ({
            value,
            sort: numbers[i]
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

}

/**
 * Groups the items in the given array based on the the getGroup function.
 *
 * @param  {Array} array
 *         Array whose items should be grouped up.
 * @param  {Function} getGroup
 *         A function that should create the name of the group. It's passed the
 *         item and the index.
 * @return {Object}
 *         An object with the groups as keys and all the matching items as
 *         values.
 */
export function groupBy(array, getGroup) {

    return array.reduce((grouped, item, i) => {

        const group = getGroup(item, i);

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(item);

        return grouped;

    }, Object.create(null));

}
