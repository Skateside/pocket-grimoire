import Observer from "../../classes/Observer.js";
import qrcode from "../../lib/qrcode.js";
import {
    lookupOneCached
} from "../../utils/elements.js";

const gameObserver = Observer.create("game");

gameObserver.on("characters-selected", ({ detail }) => {

    const {
        name,
        characters
    } = detail;

    const url = new URL(window.location.href);
    const {
        pathname
    } = url;
    const page = pathname.slice(0, pathname.lastIndexOf("/") + 1);
    url.pathname = `${page}list.html`;

    if (name) {
        url.searchParams.append("name", name);
    }

    const ids = characters.map((character) => character.getId()).join(",");
    url.searchParams.append("characters", ids);

    const qr = new qrcode(0, "H");
    qr.addData(url.toString());
    qr.make();
    lookupOneCached("#qr-code").innerHTML = qr.createSvgTag({});
    lookupOneCached("#qr-code-button").disabled = false;
    lookupOneCached("#qr-code-link").href = url.toString();

});
