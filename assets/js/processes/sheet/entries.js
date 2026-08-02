import CharacterToken from "../../classes/CharacterToken.js";
import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import {
    lookupOne,
    lookupOneCached,
} from "../../utils/elements.js";
import {
    get,
} from "../../utils/fetch.js";

CharacterToken.setTemplates({
    entry: Template.create(lookupOne("#sheet-entry")),
    entryJinx: Template.create(lookupOne("#sheet-entry-jinx")),
});

TokenStore.ready((tokenStore) => {

console.log({ tokenStore });

    const url = new URL(window.location.href);
    const characters = url.searchParams.get("characters");
    const game = url.searchParams.get("game");

    if (characters) {
        drawCharacters(tokenStore, characters.split(","));
    } else if (game) {
        get(window.URLS.getGame, { game }).then((json) => {
            console.log({ json });
        });
    }

});

function drawCharacters(tokenStore, ids) {

    const sheetGroupTemplate = Template.create(lookupOne("#sheet-group"));
    const groups = [
        ["townsfolk"],
        ["outsider"],
        ["minion"],
        ["demon"],
        ["traveller"],
        ["fabled"],
        ["loric"],
    ];
    const renders = {};

    ids.forEach((id) => {

        const character = tokenStore.getCharacter(id);

        if (!character) {
            return console.warn(`Can't find character with ID "${id}"`);
        }

        const team = character.getTeam();
        const group = groups.find(([groupName]) => groupName === team);

        if (!group) {
            return console.warn(`Unrecognised team "${team}"`);
        } else if (!group[1]) {

            group[1] = sheetGroupTemplate.draw({
                ".js--sheet-group--name"(element) {
                    element.textContent = window.I18N?.[group[0]] || group[0];
                },
            });

            group[1].querySelector(".js--sheet-group--wrapper").open = [
                "townsfolk",
                "outsider",
                "minion",
                "demon",
            ].includes(team);

        }

        renders[id] = character.drawSheetEntry();

        const contents = lookupOneCached(".js--sheet-group--contents", group[1]);

        contents.append(renders[id]);

    });

    groups.forEach(([ignore, markup]) => {
        if (markup) {
            lookupOneCached("#sheet-groups").append(markup);
        }
    });

}


