import { VERSION } from "../constants/version.js";
import Store from "../classes/Store.js";

function createScript(url) {

    return new Promise((resolve, reject) => {

        const script = document.createElement("script");
        script.addEventListener("load", () => resolve());
        script.addEventListener("error", () => reject());
        script.src = url;

        const firstScript = document.getElementsByTagName("script")[0];

        if (!firstScript) {
            return reject(new Error("Cannot find any script tags"));
        }

        firstScript.parentElement.insertBefore(script, firstScript);

    });

}

const store = Store.create("pocket-grimoire");

if (window.location.hostname !== "127.0.0.1") {

    createScript("https://unpkg.com/highlight.run").then(() => {

        H.init("qe9xppe1", {
            environment: window.ENVIRONMENT || "dev",
            version: VERSION,
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
                urlBlocklist: [
                    "https://www.googleapis.com/identitytoolkit",
                    "https://securetoken.googleapis.com",
                ],
            },
        });

        let user = store.getUser();

        if (!user) {

            user = (
                typeof window.crypto?.randomUUID === "function"
                ? window.crypto.randomUUID()
                : `user-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
            );
            store.setUser(user);

        }

        H.identify(user);

    });

}
