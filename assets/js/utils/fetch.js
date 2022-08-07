/**
 * Fetches information from the given URL and stores it in the given store. The
 * URL is checked against the store to see if the data already exists and only
 * performs a lookup if it needs to.
 *
 * @param  {String} key
 *         The key for identifying the URL. This allows the URL to be updated
 *         with a hash, making it unique, while also allowing it to be cached.
 * @param  {String} url
 *         URL from which to get the data.
 * @param  {Store} store
 *         Store that will store the results.
 * @return {Promise}
 *         Promise that resolves with the data from the lookup.
 */
export function fetchFromStore(key, url, store) {

    const results = store.getLookup(key);

    if (results !== undefined) {
        return Promise.resolve(results);
    }

    return fetch(url)
        .then((response) => response.json())
        .then((json) => {

            store.setLookup(key, json);
            return json;

        });

}

/**
 * Helper function for POSTing JSON data to the given URL.
 *
 * @param  {String} url
 *         URL to POST the data to.
 * @param  {Array|Object|String|Boolean|Number|null} data
 *         JSON data to POST.
 * @return {Promise}
 *         A promise that resolves with the response from the server, converted
 *         into JSON.
 */
export function post(url, data) {

    return fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data)
    }).then((response) => response.json());

}
