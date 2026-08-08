import CharacterToken from "../../classes/CharacterToken.js";
import Jinx from "../../classes/Jinx.js";
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
});
Jinx.setTemplates({
    entry: Template.create(lookupOne("#sheet-entry-jinx")),
    sheet: Template.create(lookupOne("#sheet-jinx")),
});

function isOfficialRole(role) {

    return (
        typeof role === "string"
        || (
            typeof role === "object"
            && !Array.isArray(role)
            && Object.keys(role).length === 1
            && typeof role.id === "string"
        )
    );

}

TokenStore.ready((tokenStore) => {

    const url = new URL(window.location.href);
    const characters = url.searchParams.get("characters");
    const game = url.searchParams.get("game");

    if (characters) {
        drawCharacters(tokenStore, characters.split(","));
    } else if (game) {
        get(window.URLS.getGame, { game }).then((json) => {

            json.data
                .filter((role) => !isOfficialRole(role))
                .forEach((data) => {
                    tokenStore.createCustomCharacter(data);
                });

            const ids = json.data.reduce((ids, { id }) => {
                ids.push(id);
                return ids;
            }, []);

            drawCharacters(tokenStore, ids);

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
    const characters = Object.create(null);

    ids.forEach((id) => {

        const character = tokenStore.getCharacter(id);

        if (!character) {
            return console.warn(`Can't find character with ID "${id}"`);
        }

        characters[id] = character;
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

    const characterInstances = Object.values(characters);
    const jinxes = [];

    characterInstances.forEach((character) => {

        if (!character.jinxes?.length) {
            return;
        }

        const readiable = character.jinxes.filter((jinx) => {
            return characterInstances.some((role) => jinx.matches(role));
        });

        readiable.forEach((jinx) => jinxes.push(jinx));

    });

    if (jinxes.length) {

        const markup = sheetGroupTemplate.draw({
            ".js--sheet-group--wrapper"(element) {
                element.id = "wrapper-jinx";
                element.classList.add("edition--jinx");
                element.open = true;
            },
            ".js--sheet-group--name"(element) {
                element.textContent = window.I18N?.jinxes || "";
            },
        });

        lookupOneCached("#sheet-groups").append(markup);

        jinxes.forEach((jinx) => {

            lookupOneCached(
                `#entry--${jinx.target.getId()} .js--sheet-entry--jinxes`
            ).append(jinx.drawEntry());

            lookupOneCached(
                "#wrapper-jinx .js--sheet-group--contents"
            ).append(jinx.drawSheet());

        });

    }

}


