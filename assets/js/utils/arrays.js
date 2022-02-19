/**
 * Creates an array that's a shuffled version of the given array. The original
 * array is not modified.
 * Fisher-Yater (aka Knuth) Shuffle.
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
    const shuffled = [...array];

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

// Slightly slower, but more random. Only really works with arrays with fewer
// than 65,535 entries (but we won't need that many, by a long way).
// Uint8Array could be used instead of Uint16Array if we need a
// micro-optimisation.
// Schwartzian transform
// export function shuffle(array) {
//
//     const numbers = window.crypto.getRandomValues(
//         new Uint16Array(array.length)
//     );
//
//     return Array.from(array, (value, i) => ({
//             value,
//             sort: numbers[i]
//         }))
//         .sort((a, b) => a.sort - b.sort)
//         .map(({ value }) => value);
//
// }

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
