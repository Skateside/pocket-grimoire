import { supplant } from "./strings.js";

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

/**
 * Helper function for GETing JSON data from the given URL.
 *
 * @param  {String} url
 *         URL to GET the data from.
 * @param  {Array|Object|String|Boolean|Number|null} data
 *         Optional data to add into the URL.
 * @return {Promise}
 *         A promise that resolves with the response from the server, converted
 *         into JSON.
 */
export function get(url, data) {
    return fetch(supplant(window.decodeURIComponent(url), data), {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    }).then((response) => response.json());
}
