/**
 * Fetches information from the given URL and stores it in the given store. The
 * URL is checked against the store to see if the data already exists and only
 * performs a lookup if it needs to.
 *
 * @param  {String} url
 *         URL from which to get the data.
 * @param  {Store} store
 *         Store that will store the results.
 * @return {Promise}
 *         Promise that resolves with the data from the lookup.
 */
export function fetchFromStore(url, store) {

    const results = store.getLookup(url);

    if (results !== undefined) {
        return Promise.resolve(results);
    }

    return fetch(url)
        .then((response) => response.json())
        .then((json) => {

            store.setLookup(url, json);
            return json;

        });

}


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

    console.warn("getCached is deprecated - use fetchFromStore instead");

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
