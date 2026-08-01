import CharacterToken from "../../classes/CharacterToken.js";
import Template from "../../classes/Template.js";
import TokenStore from "../../classes/TokenStore.js";
import {
    lookupOne,
    lookupOneCached,
} from "../../utils/elements.js";

CharacterToken.setTemplates({
    entry: Template.create(lookupOne("#sheet-entry")),
    entryJinx: Template.create(lookupOne("#sheet-entry-jinx")),
});

TokenStore.ready((tokenStore) => {
    console.log({ tokenStore });

    const url = new URL(window.location.href);
    const characters = url.searchParams.get("characters");

    if (characters) {
        drawCharacters(tokenStore, characters.split(","));
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

        const contents = lookupOneCached(".js--sheet-group--contents", group[1]);

        contents.append(character.drawSheetEntry());

    });

    groups.forEach(([ignore, markup]) => {
        if (markup) {
            lookupOneCached("#sheet-groups").append(markup);
        }
    });

}


