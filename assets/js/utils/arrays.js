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
