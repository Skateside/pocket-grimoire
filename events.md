# Observer events

The Pocket Grimoire uses observers to keep track of when the user has done certain things, updating other parts of the application when that happens.

## Using an observer

### Creating an observer

Each observer can be created by importing the class and creating a new instance. The new observer can trigger any events it likes, they won't affect any other observers.

```js
import Observer from "./classes/Observer.js";

const observer = new Observer();
```

Alternatively, the `Observer` class has a `create()` static method that creates an observer with a name. Each named observer is stored so it can be recalled from another file. This allows multiple files to listen for the same events.

```js
import Observer from "./classes/Observer.js";

const myObserver = Observer.create("my");
```

### Listening for an event

Listen for an event using the `on` method.

```js
observer.on("do-something", (e) => {
    // ...
});
```

The handler passed to `on` will receive an event argument - this is a standard DOM event with additional information in the `detail` property. Since that's the most important part, it's common to only access it when listening for an event.

```js
observer.on("do-something", ({ detail }) => {
    // ...
});
```

### Stop listening for an event

The `off` method will remove a handler from the event.

```js
const handleDoSomething = () => {};

observer.on("do-something", handleDoSomething);
// Event is being listened to.

observer.off("do-something", handleDoSomething);
// Event is no longer being listened to.
```

### Triggering an event

The event is triggered using the `trigger` method. The name of the event is given as well as any custom information for the `detail`.

After triggering an event, the event that was triggered is returned. This allows a developer to check whether or not the default action was prevented, for example.

```js
const myEvent = observer.trigger("do-something");

if (myEvent.defaultPrevented) {
    // ...
}
```

You can pass information to the observer which will be available through the `detail` property of the event argument. The additional information can be any format, but the Pocket Grimoire always passes an object for future-proofing.

```js
observer.on("my-event", ({ detail }) => {
    console.log(detail.name);
});

observer.trigger("my-event", { name: "lorem ipsum" });
// Logs: lorem ipsum
```

## Existing observers

### Game observer

Related to the UI.

```js
const gameObserver = Observer.create("game");
```

#### `character-count-change`

- `detail.element` -> `Element`
- `detail.id` -> `String`
- `detail.active` -> `Boolean`

The number of a character has changed.

#### `character-draw`

- `detail.characters` -> `Array.<CharacterToken>`
- `detail.isShowAll` -> `Boolean`

The character tokens have been selected ready to be chosen. If the user requested to add all the tokens to the page at once, the `isShowAll` option will be true.

#### `character-drawn`

- `detail.character` -> `CharacterToken`
- `detail.element` -> `Element`
- `detail.isAutoAdd` -> `Boolean`

A character has been chosen by a player. The chosen character and the token element that was clicked are passed. The `isAutoAdd` flag would highlight that the tokens should be added automatically, possibly bypassing some functionality.

#### `characters-loaded`

- `detail.characters` -> `Array.<Object>`

The JSON feed has loaded and the game knows about all the possible characters.

#### `characters-selected`

- `detail.name` -> `String`
- `detail.characters` -> `Array.<CharacterToken>`
- `detail.game` -> `String|undefined`

The edition has been loaded or the custom script has been parsed. The edition name and the characters are passed to the event. Optionally the ID of the stored game may be passed - this only happens for homebrew scripts.

#### `character-toggle`

- `detail.element` -> `Element`
- `detail.id` -> `String`
- `detail.active` -> `Boolean`

A character has either been highlighted or unhighlighted in the "Select Characters" dialog. The input element, the ID of the character, and whether they are highlighted or not is passed.

#### `clear`

The "Clear Grimoire" button has been clicked and the popup confirmed - all tokens have been removed.

#### `inputs-repopulated`

All the inputs have been repopulated. This event exists because some situations, such as the Select Character dialog, need to know when to properly check its values and a running count can give mis-leading results since the code won't be able to tell the difference between a checkbox that's supposed to be unchecked and one that's been deselected.

#### `jinxes-ready`

- `detail.jinxes` -> `Array.<Jinx>`

Jinxes have been set. An array of all ready jinxes are passed to the event.

#### `night-order-show-all`

- `detail.showAll` -> `Boolean`

True if the user would prefer to see the whole night order, not just the characters in play, false otherwise.

#### `pad-height-change`

- `detail.height` -> `String`

Fires whenever the height of the pad is changed by the user. The height is passed to the event in the form `123px` where `123` changes depending on the height. The height may be an empty string, which would happen after the user resets the height of the pad.

#### `player-count`

- `detail.count` -> `Number`

The number of players that have been selected.

#### `team-breakdown-loaded`

- `detail.breakdown` -> `Array.<Object>`

The JSON feed has loaded and the game knows how many Townsfolk/Outsiders/Minions/Demons there should be.

### Token observer

Specifically related to the role and reminder tokens.

```js
const tokenObserver = Observer.create("token");
```

#### `bluff`

- `detail.data` -> `Object`

Fired when a demon bluff is selected. The serialised data for the bluff groups is passed to the event. The data has an `index` property which is the index of the currently visible group, and a `groups` property which contains an array of each of the groups. Each item in the array has a `name` property (the current text for bluff group) and a `set` property (an array of character IDs for each of the selected bluffs).

#### `character-add`

- `detail.character` -> `CharacterToken`
- `detail.token` -> `Element`

Fired when a character is added to the Grimoire pad.

#### `character-click`

- `detail.element` -> `Element`

Fired when a character token is clicked. The event is passed the token element and the character data.

#### `character-remove`

- `detail.character` -> `CharacterToken`
- `detail.token` -> `Element`

Fired when a character is removed from the Grimoire pad.

#### `ghost-vote-toggle`

- `detail.hasGhostVote` -> `Boolean`
- `detail.token` -> `Element`
- `detail.character` -> `CharacterToken`

Fired when a character's ghost vote status is toggled. By default a character does not have a ghost vote (because the character is alive) but gains one whenever they die (ghost votes are reset when a player is revived). The `hasGhostVote` will be true if the player has a ghost vote and false if it doesn't.

#### `move`

- `detail.element` -> `Element`
- `detail.left` -> `Number`
- `detail.top` -> `Number`
- `detail.zindex` -> `Number`

Fired when a token is moved on the pad, either a character or reminder token.

#### `reminder-add`

- `detail.reminder` -> `ReminderToken`
- `detail.token` -> `Element`

Fired when a reminder is added to the Grimoire pad.

#### `reminder-click`

- `detail.element` -> `Element`

Fired when a character token is clicked. The event is passed the token element and the reminded data.

#### `reminder-remove`

- `detail.reminder` -> `ReminderToken`
- `detail.token` -> `Element`

Fired when a reminder is removed from the Grimoire pad.

#### `rotate-toggle`

- `detail.isUpsideDown` -> `Boolean`
- `detail.token` -> `Element`
- `detail.character` -> `CharacterToken`

Fired when a character's token is rotated so it's either upside-down or right-side-up. The isUpsideDown parameter will be true if the token is upside-down was added and false if it is not.

#### `set-player-name`

- `detail.character` -> `CharacterToken`
- `detail.token` -> `Element`
- `detail.name` -> `String`

Fired with a player token has been named. The name is passed to the event.

#### `shroud-toggle`

- `detail.isDead` -> `Boolean`
- `detail.token` -> `Element`
- `detail.character` -> `CharacterToken`

Fired when a character's shroud is toggled, either added or removed. The isDead parameter will be true if the shroud was added and false if it was removed.

#### `toggle-jinx-active`

- `detail.jinx` -> `Jinx`
- `detail.state` -> `Boolean`

Fired when a jinx's "active" state is changed. The jinx and the state are passed to the event.

#### `toggle-jinx-ready`

- `detail.jinx` -> `Jinx`
- `detail.state` -> `Boolean`

Fired when a jinx's "ready" state is changed. The jinx and the state are passed to the event.
A jinx is "ready" when it appears on the script.

#### `toggle-jinx-target`

- `detail.jinx` -> `Jinx`
- `detail.state` -> `Boolean`

Fired when a jinx's "target" state is changed, so that character has been selected or de-selected. The jinx and the state are passed to the event.

The jinx's target is the character that has the jinx, or the icon that should have smaller icons underneath it on the character sheet.

#### `toggle-jinx-trick`

- `detail.jinx` -> `Jinx`
- `detail.state` -> `Boolean`

Fired when a jinx's "trick" state is changed, so that character has been selected or de-selected. The jinx and the state are passed to the event.

The jinx's trick is the character that the target is jinxes with, or the smaller icons under the larger one on the character sheet.

#### `zindex`

- `detail.zindex` -> `Number`

Fired when a new z-index is set for a token.

### Info Token Observer

Related to custom info tokens.

```js
const infoTokenObserver = Observer.create("info-token");
```

#### `info-token-added`

- `detail.token` -> `InfoToken`
- `detail.index` -> `Number`

A custom info token has been added. The index is only present if the token is added through the store - it exists so that the store knows which token instance is related to which piece of text.

#### `info-token-deleted`

- `detail.token` -> `InfoToken`

A custom info token has been removed.

#### `info-token-updated`

- `detail.token` -> `InfoToken`

The text of a custom info token has been updated.
