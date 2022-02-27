const cacheName = "pocket-grimoire";
const filesToCache = [

    // Filenames and pages.
    "./",
    "./index.html",
    // "./sheet.html",

    // JS and CSS files.
    "./assets/js/main.js",
    "./assets/css/main.css",
    // "./assets/js/sheet.js",
    // "./assets/css/sheet.css",
    // "./assets/js/dialog.js",
    // "./assets/css/dialog.css",

    // Generic icons for the teams.
    "./assets/img/icon/townsfolk.png",
    "./assets/img/icon/outsider.png",
    "./assets/img/icon/minion.png",
    "./assets/img/icon/demon.png",
    "./assets/img/icon/traveller.png",
    "./assets/img/icon/fabled.png",

];

const iconRegExp = (/\/icon\/(townsfolk|outsider|minion|demon|traveller|fabled)/);

const genericIcons = Object.fromEntries(
    filesToCache
        .filter((file) => iconRegExp.test(file))
        .map((file) => [file.match(iconRegExp)[1], file])
);

self.addEventListener("install", (e) => {

    e.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => cache.addAll(filesToCache))
    );

});

self.addEventListener("activate", (e) => {
    self.clients.claim();
});

// NOTE:
// this is currently replacing all the icons with their replacements. This
// should only trigger if the website is offline.
self.addEventListener("fetch", (e) => {

    const {
        request
    } = e;

    e.respondWith(
        caches
            .match(request)
            .then((response) => {

                if (response) {
                    return response;
                }

                const match = request.url.match(iconRegExp);

                return fetch(genericIcons[match?.[1]] || request);

            })
    );

});
