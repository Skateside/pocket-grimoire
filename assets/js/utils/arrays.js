/**
 * Creates an array that's a shuffled version of the given array. The original
 * array is not modified.
 *
 * @param  {Array} array
 *         Array to shuffle.
 * @return {Array}
 *         Shuffled array.
 * @see    https://stackoverflow.com/a/2450976/557019
 */
export function shuffle(array) {

    let currentIndex = array.length;
    let randomIndex = -1;
    const shuffled = array.concat();

    while (currentIndex !== 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        [shuffled[currentIndex], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[currentIndex]
        ];

    }

    return shuffled;

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
