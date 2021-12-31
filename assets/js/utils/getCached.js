const ONE_WEEK = (
    7      // days
    * 24   // hour
    * 60   // minutes
    * 60   // seconds
    * 1000 // milliseconds
);

/**
 * Gets information from an AJAX call. The results are cached and last for the
 * amount of time specified in the `expires` parameter.
 *
 * @param  {String} url
 *         URL to get data from.
 * @param  {Number} [expires=ONE_WEEK]
 *         Milliseconds that the data will last for.
 * @return {Promise}
 *         A promise that resolves with the fetched data.
 */
export function getCached(url, expires = ONE_WEEK) {

    const localStorageKey = `pocket-grimoire--${url}`;
    const localData = JSON.parse(localStorage.getItem(localStorageKey));

    if (localData?.expires > Date.now()) {
        return Promise.resolve(localData.data);
    }

    return fetch(url)
        .then((response) => response.json())
        .then((characters) => {

            localStorage.setItem(
                localStorageKey,
                JSON.stringify({
                    expires: Date.now() + expires,
                    data: characters
                })
            );

            return characters;

        });

}
