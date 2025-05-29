# Homebrew

The Pocket Grimoire supports homebrew characters. The data for homebrew characters will match the [Official Script Schema](https://github.com/ThePandemoniumInstitute/botc-release). Here's a quick overview of that, plus any changes between the official app and the Pocket Grimoire.

## Characters

Here are the properties that the Pocket Grimoire currently understands:

| Name | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `id` | string | Yes | - | The ID of the role. Interally, the ID will be converted into lower case and any underscores will be removed. |
| `name` | string | Yes | - | The name of the role. |
| `team` | string | Yes | - | One of "townsfolk", "outsider", "minion", "demon", "traveler", or "fabled".<br>The Pocket Grimoire also understands the British English spelling of "traveller". |
| `ability` | string | Yes | - | The role's ability. |
| `edition` | string | No | `""` | One of "tb", "bmr", "snv", or ""<br>The Pocket Grimoire also recognises two editions from the Chinese community: "hdcs" and "syyl" |
| `image` | string \| string[] | No | `""` | Either the URL of the image, or an array of images.<br>The Pocket Grimoire only understands the first entry in an array of strings - alternate alignment pictures are not currently supported, although [there is a bug mentioning that](https://github.com/Skateside/pocket-grimoire/issues/80) |
| `firstNight` | number | No | `0` | When the character acts on the first night, or `0` if the character doesn't act. |
| `firstNightReminder` | string | No | `""` | Text to remind the Story Teller of what to do with the character on the first night. |
| `otherNight` | number | No | `0` | When the character acts on other nights, or `0` if the character doesn't act. |
| `otherNightReminder` | string | No | `""` | Text to remind the Story Teller of what to do with the character on other nights. |
| `reminders` | string[] | No | `[]` | Any reminders for the role. |
| `remindersGlobal` | string[] | No | `[]` | Any global reminders for the role. |
| `setup` | boolean | No | `false` | Whether or not the role changes something at setup. |
| `special` | object[] | No | `[]` | [See Special note below](#special) |
| `jinxes` | object[] | No | `[]` | [See Jinxes note below](#jinxes) |

### Example

Here is an example of the Philosopher using the rules above. The order of the properties doesn't matter.

```json
{
    "id": "philosopher",
    "name": "Philosopher",
    "team": "townsfolk",
    "ability": "Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.",
    "edition": "snv",
    "image": "https://i.imgur.com/philosopher.webp",
    "firstNight": 2,
    "firstNightReminder": "The Philosopher either shows a 'no' head signal, or points to a good character on their sheet. If they chose a character: Swap the out-of-play character token with the Philosopher token. Or, if the character is in play, place the drunk marker by that player and the Not the Philosopher token by the Philosopher.",
    "otherNight": 2,
    "otherNightReminder": "If the Philosopher has not used their ability: the Philosopher either shows a 'no' head signal, or points to a good character on their sheet. If they chose a character: Swap the out-of-play character token with the Philosopher token. Or, if the character is in play, place the drunk marker by that player and the Not the Philosopher token by the Philosopher.",
    "reminders": [],
    "remindersGlobal": [
        "Is the Philosopher",
        "Drunk"
    ],
    "setup": false,
    "special": [
        {
            "type": "reveal",
            "name": "replace-character"
        }
    ],
    "jinxes": [
        {
            "id": "bountyhunter",
            "reason": "If the Philosopher gains the Bounty Hunter ability, a Townsfolk might turn evil."
        }
    ]
}
```

### Special

A special rule changes the way that some roles act. [The official JSON schema defines some special rules](https://github.com/ThePandemoniumInstitute/botc-release#special-app-features) - the Pocket Grimoire does not support them all.

The Pocket Grimoire currently supports these special rules:

#### Type `reveal`

- **Name: `replace-character`:** If the _first_ `remindersGlobal` entry is added to the grimoire, the role is considered to be in play.

#### Type: `selection`

- **Name: `bag-disabled`** This role can't be added to the bag. If you try, an error will be shown.

> [!TIP]
> Check back regularly to see if any new rules have become supported.<br>Any new rules will have the same names as the official JSON schema and will work in a similar way.

### Jinxes

A jinx is an object with two required properties:

| Name | Type | Description |
|:---|:---|:---|
| `id` | string | The ID of the role that this role is jinxed with. |
| `reason` | string | A description of the jinx. |

The role can have any number of jinxes.

> [!NOTE]
> The `id` can refer to any role, including official ones.

## Combining Homebrew and Official Characters

A script can contain references to official characters as well as homebrew ones. To reference an official character, just include its ID as a string - the ID will be the English name in lower case with no spaces or punctuation marks.

For example, here is Trouble Brewing with a custom demon defined as well:

```json
[
    "washerwoman",
    "librarian",
    "investigator",
    "chef",
    "empath",
    "fortuneteller",
    "undertaker",
    "monk",
    "ravenkeeper",
    "virgin",
    "slayer",
    "soldier",
    "mayor",
    "butler",
    "drunk",
    "recluse",
    "saint",
    "poisoner",
    "spy",
    "scarletwoman",
    "baron",
    "imp",
    "bureaucrat",
    "thief",
    "gunslinger",
    "scapegoat",
    "beggar",
    {
        "id": "juggernaut",
        "name": "Juggernaut",
        "team": "demon",
        "ability": "Each night*, choose a player: they die even if for some reason they could not. There is always a good player you cannot kill.",
        "image": "https://i.imgur.com/juggernaut.webp",
        "otherNight": 24,
        "otherNightReminder": "The Juggernaut points to a player. That player dies.",
        "reminders": [
            "Dead",
            "Cannot kill"
        ]
    }
]
```

> [!NOTE]
> Official characters are translated when the language is changed, but homebrew characters are not.
