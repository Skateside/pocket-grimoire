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
