# Pocket Grimoire

[PocketGrimoire.co.uk](https://www.pocketgrimoire.co.uk)

A digital version of the [Blood on the Clocktower](https://bloodontheclocktower.com) grimoire, allowing in-person games.

## Getting Started

When you first load the Pocket Grimoire, you'll be presented with a simple screen with the Setup section open and two of the buttons will be disabled.

![The starting screen for the Pocket Grimoire](https://www.pocketgrimoire.co.uk/docs/starting-screen.jpg)

Select an edition to load the character data. It's possible to manage custom scripts, see the section lower down for more details.

![The "Select Edition" screen with "Trouble Brewing" selected](https://www.pocketgrimoire.co.uk/docs/select-edition.jpg)

Once you've selected your edition, the buttons in the Setup screen will enable. This allows you to tap the "Character sheet" button and reveal a QR code that your players can scan to get see the list of characters on their phones.

![A QR code that will link to the "Trouble Brewing" script](https://www.pocketgrimoire.co.uk/docs/qr-code.jpg)

> :information_source: Notice how the background fully obscures the grimoire instead of blurring it? If the background is blurred then the screen should only be seen by the Story Teller, but if the grimoire is fully hidden by the background then the screen can be shown to the players.

As your players are familiarising themselves with the script, you can close that screen and tap the "Select Characters" button to select the characters . The characters can be selected manually or you can tap the "Highlight random" button to randomly select the tokens for you.

![A series of tokens with numbers on them, from one to seven](https://www.pocketgrimoire.co.uk/docs/select-characters.jpg)

> :information_source: If you select the character and a red exclamation mark appears then the character changes the setup of the game. This may mean that other characters need to be selected. A yellow star means that a the character is jinxed with another one - including that character will add a section to the main screen that explains the effect of the Jinx on this game.

When you're happy with the selection, tap the "Draw Characters" button to let your players draw their tokens.

![A series of tokens with numbers on them, from one to seven](https://www.pocketgrimoire.co.uk/docs/select-numbers.jpg)

Tapping on any of the numbers will show the token - that will be that player's character. As a token is chosen, that number is greyed out to prevent it being selected again.

When all the tokens have been selected, close that screen and open the Grimoire section. Each of the chosen tokens will be added to the grimoire, with the first token on the bottom and the most recently chosen on at the top.

![The tokens have been added to the grimoire, but they're bunched together](https://www.pocketgrimoire.co.uk/docs/tokens-added.jpg)

Organise the grimoire however you prefer, add any reminder tokens that you need, and set up some demon bluffs.

![The tokens have been sorted in the grimoire](https://www.pocketgrimoire.co.uk/docs/game-ready.jpg)

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

> :warning: There is currently no support for homebrew characters or localised characters. Only official (and unreleased but announced) IDs will be recognised.

Optionally, you can include a name for the script. To do this, include an entry in the JSON with the ID `_meta`:

```js
[
    { "id": "_meta", "name": "Trouble Brewing" },
    // ...
]
```
