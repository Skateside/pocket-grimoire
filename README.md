# Pocket Grimoire

[PocketGrimoire.co.uk](https://www.pocketgrimoire.co.uk)

A digital version of the [Blood on the Clocktower](https://bloodontheclocktower.com) grimoire, allowing in-person games.

## Table of Contents

- [Getting Started](#getting-started)
- [Custom Scripts](#custom-scripts)
- [Custom Character Support](#custom-character-support)
- [Translations and Typos](#translations-and-typos)
- [Contributing](CONTRIBUTING.md)

## Getting Started

When you first load the Pocket Grimoire, you'll be presented with a simple screen with the Setup section open and two of the buttons will be disabled.

![The starting screen for the Pocket Grimoire](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/starting-screen.jpg)

Select an edition to load the character data. It's possible to manage custom scripts, see the section lower down for more details.

![The "Select Edition" screen with "Trouble Brewing" selected](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/select-edition.jpg)

Once you've selected your edition, the buttons in the Setup screen will enable. This allows you to tap the "Character sheet" button and reveal a QR code that your players can scan to get see the list of characters on their phones.

![A QR code that will link to the "Trouble Brewing" script](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/qr-code.jpg)

> :information_source: Notice how the background fully obscures the grimoire instead of blurring it? If the background is blurred then the screen should only be seen by the Story Teller, but if the grimoire is fully hidden by the background then the screen can be shown to the players.

As your players are familiarising themselves with the script, you can close that screen and tap the "Select Characters" button to select the characters . The characters can be selected manually or you can tap the "Highlight random" button to randomly select the tokens for you.

![A series of tokens with numbers on them, from one to seven](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/select-characters.jpg)

> :information_source: If you select the character and a red exclamation mark appears then the character changes the setup of the game. This may mean that other characters need to be selected. A yellow star means that a the character is jinxed with another one - including that character will add a section to the main screen that explains the effect of the Jinx on this game.

When you're happy with the selection, tap the "Draw Characters" button to let your players draw their tokens.

![A series of tokens with numbers on them, from one to seven](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/select-numbers.jpg)

Tapping on any of the numbers will show the token - that will be that player's character. As a token is chosen, that number is greyed out to prevent it being selected again.

When all the tokens have been selected, close that screen and open the Grimoire section. Each of the chosen tokens will be added to the grimoire, with the first token on the bottom and the most recently chosen on at the top.

![The tokens have been added to the grimoire, but they're bunched together](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/tokens-added.jpg)

Organise the grimoire however you prefer, add any reminder tokens that you need, and set up some demon bluffs.

![The tokens have been sorted in the grimoire](https://raw.githubusercontent.com/Skateside/pocket-grimoire/main/assets/img/docs/game-ready.jpg)

You're now ready to play a game of Blood on the Clocktower - have fun!

## Custom Scripts

As well as the three official scripts, the Pocket Grimoire can allow you to work with custom scripts. A custom script should be a list of IDs for the characters on the script. For example, here's Trouble Brewing as a custom script, including the travellers:

```json
[
    { "id": "washerwoman" },
    { "id": "librarian" },
    { "id": "investigator" },
    { "id": "chef" },
    { "id": "empath" },
    { "id": "fortuneteller" },
    { "id": "undertaker" },
    { "id": "monk" },
    { "id": "ravenkeeper" },
    { "id": "virgin" },
    { "id": "slayer" },
    { "id": "soldier" },
    { "id": "mayor" },
    { "id": "butler" },
    { "id": "drunk" },
    { "id": "recluse" },
    { "id": "saint" },
    { "id": "poisoner" },
    { "id": "spy" },
    { "id": "scarletwoman" },
    { "id": "baron" },
    { "id": "imp" },
    { "id": "bureaucrat" },
    { "id": "thief" },
    { "id": "gunslinger" },
    { "id": "scapegoat" },
    { "id": "beggar" }
]
```

The JSON file created on the [official script tool](https://script.bloodontheclocktower.com/) will be understood.

Optionally, you can include a name for the script. To do this, include an entry in the JSON with the ID `_meta`:

```js
[
    { "id": "_meta", "name": "Trouble Brewing" },
    // ...
]
```

## Custom Character Support

The Pocket Grimoire understands custom characters. In order to use them, you'll need to create a JSON definition. The JSON definition uses the same format that [clocktower.online](https://clocktower.online/) does.

> :information_source: You can combine official and homebrew character by simply adding your homebrew character to a list of recognised IDs, such as the Trouble Brewing example in the [Custom Scripts](#custom-scripts) section.

```json
[
    {
        "id": "acrobat",
        "image": "https://github.com/bra1n/townsquare/blob/main/src/assets/icons/acrobat.png?raw=true",
        "firstNight": 0,
        "firstNightReminder": "",
        "otherNight": 49,
        "otherNightReminder": "If either good living neighbour is drunk or poisoned, the Acrobat dies.",
        "reminders": ["Die"],
        "remindersGlobal": [],
        "setup": false,
        "name": "Acrobat",
        "team": "outsider",
        "ability": "Each night*, if either good living neighbour is drunk or poisoned, you die."
    }
]
```

**Required properties**: `name`, `ability`, `image`, `team`, `reminders`, `remindersGlobal`

-   `id`: A unique ID for the character. It shouldn't have any spaces or special characters.
-   `image`: A URL to a PNG of the character token icon. It should have a transparent background.
-   `firstNight` / `otherNight`: The position that this character acts on the first / other nights, compared to other characters.
    <br>_Note:_ this must be a positive whole number or zero, with zero being treated as "does not act during the night".
-   `firstNightReminder` / `otherNightReminder`: reminder text for the first / other nights.
-   `reminders`: reminder tokens. It should be an empty array (`[]`) if there are none.
-   `remindersGlobal`: global reminder tokens that will always be available, no matter if the character is assigned to a player or not. It should be an empty array (`[]`) if there are none.
-   `setup`: whether this token affects the setup.
-   `name`: name of the character.
-   `team`: the team of the character. It has to be one of `townsfolk`, `outsider`, `minion`, `demon`, `traveler` (`traveller` is understood as an alternative spelling), or `fabled`.
-   `ability`: the displayed ability of the character.

> :warning: The text for custom characters is not translated if the language is changed.

## Translations and Typos

If you've noticed a typo, or you have a better translation or would like to add a new language, there are 3 files that will need to be updated:

1.  [The Community BotC Translations](https://docs.google.com/spreadsheets/d/1aAJdqSTafHnw01w-WZ94UPx1Me70Kz-EG1NFfBht2tA/edit#gid=923580658)
    <br>This file contains translations for the tokens, reminders, and abilities.
    <br>Since this file wasn't created by me, you'll need to let me know of any updates.
    <br>This file has many more translations than the Pocket Grimoire has.

2.  [The Jinxes](https://docs.google.com/spreadsheets/d/1EJQzuQNlzTvNzAOJEIldu0ILKNU3UhsgFr-TZnhxpVM/edit#gid=1649450121)
    <br>This file contains translations for the jinxes.
    <br>It was created as a separate file so that it could be easily used in other projects.

3.  [The Pocket Grimoire](https://docs.google.com/spreadsheets/d/1YjI3LcLnLbuONbjbniZTZa1BIT8MKBb8TuIprtmkjAw/edit#gid=19211044)
    <br>This file contains translations for anything that's specific for the Pocket Grimoire.

As soon as a translation exists in all 3 documents, I can add it to the Pocket Grimoire 🙂
