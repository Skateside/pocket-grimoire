[1mdiff --git a/assets/data/characters.json b/assets/data/characters.json[m
[1mindex 933d9d4..90fffa9 100644[m
[1m--- a/assets/data/characters.json[m
[1m+++ b/assets/data/characters.json[m
[36m@@ -52,6 +52,20 @@[m
         "ability": "Each night*, choose 3 players (all players learn who): each silently chooses to live or die, but if all live, all die.",[m
         "image": "/build/img/icons/demon/alhadikhia.webp"[m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "edition": "",[m
[32m+[m[32m        "team": "townsfolk",[m
[32m+[m[32m        "firstNight": 0,[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNight": 0,[m
[32m+[m[32m        "otherNightReminder": "Choose a player, that player dies.",[m
[32m+[m[32m        "reminders": [],[m
[32m+[m[32m        "setup": false,[m
[32m+[m[32m        "ability": "Once per day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.",[m
[32m+[m[32m        "image": "/build/img/icons/townsfolk/alsaahir.webp"[m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Amnesiac",[m
[36m@@ -162,7 +176,7 @@[m
             "Seen Traveller"[m
         ],[m
         "setup": true,[m
[31m-        "ability": "Each night, you learn 1 player of each character type, until there are no more types to learn. [+1 Outsider]",[m
[32m+[m[32m        "ability": "Each night, you learn 1 player of each character type, until there are no more types to learn. [+0 or +1 Outsider]",[m
         "image": "/build/img/icons/townsfolk/balloonist.webp"[m
     },[m
     {[m
[36m@@ -1247,7 +1261,7 @@[m
             "2nd"[m
         ],[m
         "setup": false,[m
[31m-        "ability": "Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or both might die.",[m
[32m+[m[32m        "ability": "Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.",[m
         "image": "/build/img/icons/minion/harpy.webp"[m
     },[m
     {[m
[36m@@ -2034,7 +2048,9 @@[m
         "firstNightReminder": "The Ogre points to a player (not themselves) and becomes their alignment.",[m
         "otherNight": 0,[m
         "otherNightReminder": "",[m
[31m-        "reminders": [],[m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Friend"[m
[32m+[m[32m        ],[m
         "setup": false,[m
         "ability": "On your 1st night, choose a player (not yourself): you become their alignment (you don't know which) even if drunk or poisoned.",[m
         "image": "/build/img/icons/outsider/ogre.webp"[m
[36m@@ -2176,7 +2192,7 @@[m
             "Storyteller Ability"[m
         ],[m
         "setup": false,[m
[31m-        "ability": "If you die, the Storyteller gains a not-in-play Minion ability.",[m
[32m+[m[32m        "ability": "If you die, the Storyteller gains a Minion ability.",[m
         "image": "/build/img/icons/outsider/plaguedoctor.webp"[m
     },[m
     {[m
[1mdiff --git a/assets/data/characters/de_DE.json b/assets/data/characters/de_DE.json[m
[1mindex 88e710c..12d252f 100644[m
[1m--- a/assets/data/characters/de_DE.json[m
[1m+++ b/assets/data/characters/de_DE.json[m
[36m@@ -36,6 +36,15 @@[m
             "Wähle Tod"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Einmal am Tag gewinnt der Gute, wenn Sie öffentlich erraten, welche Spieler Diener und welche Dämonen sind.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Amnesiker",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Ballonfahrer",[m
[31m-        "ability": "Du erfährst jede Nacht 1 Spieler eines anderen Charaktertyps, bis keine übrig bleiben. [+1 Außenseiter]",[m
[32m+[m[32m        "ability": "Du erfährst jede Nacht 1 Spieler eines anderen Charaktertyps, bis keine übrig bleiben. [+0 oder +1 Außenseiter]",[m
         "firstNightReminder": "Wähle eine Charakterklasse. Zeige auf einen Spieler dessen Charakter dieser Klasse entspricht. Platziere den \"Gesehen\" Reminder neben den Charakter.",[m
         "otherNightReminder": "Wähle eine Charakterklasse neben dem noch kein \"Gesehen\" reminder liegt. Zeige auf einen Spieler dessen Charakter dieser Klasse entspricht. Platziere den \"Gesehen\" Reminder neben den Charakter.",[m
         "remindersGlobal": [],[m
[36m@@ -1092,7 +1101,9 @@[m
         "firstNightReminder": "Der Oger zeigt auf einen Spieler (nicht auf sich selbst) und wird zu seiner Gesinnung.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Freund"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/es_AR.json b/assets/data/characters/es_AR.json[m
[1mindex 1372b0b..30aa7d5 100644[m
[1m--- a/assets/data/characters/es_AR.json[m
[1m+++ b/assets/data/characters/es_AR.json[m
[36m@@ -36,6 +36,15 @@[m
             "Eligió vivir"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Una vez al día, si adivinas públicamente qué jugadores son Minion(s) y cuáles son Demon(s), el bien gana.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Amnésico",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Aeronauta",[m
[31m-        "ability": "Cada noche, aprendes 1 jugador de cada tipo de personaje, hasta que no queden más tipos para aprender [+1 Forastero]",[m
[32m+[m[32m        "ability": "Cada noche, aprendes 1 jugador de cada tipo de personaje, hasta que no queden más tipos para aprender [+0 o +1 Forastero]",[m
         "firstNightReminder": "Elegí un tipo de personaje. Apunta a un jugador de ese tipo de personaje. Pone el recordatorio de 'Vio (tipo)' junto al personaje.",[m
         "otherNightReminder": "Elegí un tipo de personaje que no tenga el recordatorio 'Vio (tipo)' de ese tipo. Apunta a un jugador de ese tipo de personaje, si hay alguno. Pone el recordatorio de 'Vio (tipo)' junto al personaje.",[m
         "remindersGlobal": [],[m
[36m@@ -1083,7 +1092,9 @@[m
         "firstNightReminder": "El Ogro señala a un jugador (no a sí mismo) y se convierte en su alineación.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Amigo"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/es_ES.json b/assets/data/characters/es_ES.json[m
[1mindex ab517cb..fc306e6 100644[m
[1m--- a/assets/data/characters/es_ES.json[m
[1m+++ b/assets/data/characters/es_ES.json[m
[36m@@ -36,6 +36,15 @@[m
             "Elige vida"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Una vez al día, si adivinas públicamente qué jugadores son Minion(s) y cuáles son Demon(s), el bien gana.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Amnésico",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Aeronauta",[m
[31m-        "ability": "Cada noche descubres 1 jugador de cada tipo de personaje hasta que no queden más tipos. [+1 Forastero]",[m
[32m+[m[32m        "ability": "Cada noche descubres 1 jugador de cada tipo de personaje hasta que no queden más tipos. [+0 o +1 Forastero]",[m
         "firstNightReminder": "Elige un tipo de personaje. Señala a un jugador que tenga un personaje de ese tipo. Pon el recordatorio \"Divisado\" del Aeronauta junto a ese personaje.",[m
         "otherNightReminder": "Elige un tipo de personaje que aún no tenga el recordatorio \"Divisado\" junto a un personaje de ese tipo. Señala a un jugador cuyo personaje sea de ese tipo, si los hay. Pon el recordatorio \"Divisado\" del Aeronauta junto a ese personaje.",[m
         "remindersGlobal": [],[m
[36m@@ -1093,7 +1102,9 @@[m
         "firstNightReminder": "El Ogro señala a un jugador (no a sí mismo) y se convierte en su alineación.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Amigo"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/fr_FR.json b/assets/data/characters/fr_FR.json[m
[1mindex cc50ed5..a42fa15 100644[m
[1m--- a/assets/data/characters/fr_FR.json[m
[1m+++ b/assets/data/characters/fr_FR.json[m
[36m@@ -36,6 +36,15 @@[m
             "Veut vivre"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Chaque jour, si vous devinez publiquement quels joueurs est/sont Sbires et quels joueurs est/sont Démons, les Bons gagnent.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Amnesique",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Aéronaute",[m
[31m-        "ability": "Chaque nuit, vous apprenez 1 joueur de chaque type, jusqu'à ce qu'il n'y ait plus de types à découvrir [+1 Étranger].",[m
[32m+[m[32m        "ability": "Chaque nuit, vous apprenez 1 joueur de chaque type, jusqu'à ce qu'il n'y ait plus de types à découvrir [+0/+1 Étranger].",[m
         "firstNightReminder": "Choisissez un type de rôle. Pointez un joueur dont le rôle est de ce type. Placez le rappel « Vu » de l'Aéronaute sous ce rôle.",[m
         "otherNightReminder": "Choisissez un type de rôle que vous n'avez pas encore choisi. Pointez un joueur dont le rôle est de ce type. Placez le rappel « Vu » de l'Aéronaute sous ce rôle.",[m
         "remindersGlobal": [],[m
[36m@@ -694,7 +703,7 @@[m
     {[m
         "id": "harpy",[m
         "name": "Harpie",[m
[31m-        "ability": "Chaque nuit, choisissez 2 joueurs: demain, le 1er joueur est Dément que le 2nd est Maléfique, ou les deux pourraient mourir.",[m
[32m+[m[32m        "ability": "Chaque nuit, choisissez 2 joueurs: demain, le 1er joueur est Dément que le 2nd est Maléfique, ou l'un ou les deux pourraient mourir.",[m
         "firstNightReminder": "Réveillez la Harpie; elle pointe un jouer, puis un autre. Réveillez le 1er joueur que la Harpie a pointé, montrez lui la carte \"Ce personnage vous a choisis\", montrez leur le jeton de la Harpie, puis pointez le 2eme joueur que la Harpie a pointé.",[m
         "otherNightReminder": "Réveillez la Harpie; elle pointe un jouer, puis un autre. Réveillez le 1er joueur que la Harpie a pointé, montrez lui la carte \"Ce personnage vous a choisis\", montrez leur le jeton de la Harpie, puis pointez le 2eme joueur que la Harpie a pointé.",[m
         "remindersGlobal": [],[m
[36m@@ -1094,7 +1103,9 @@[m
         "firstNightReminder": "L'Ogre choisit un joueur: il change d'alignement pour ce joueur. Ne lui annoncez pas son nouvel alignement.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Ami"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[36m@@ -1172,7 +1183,7 @@[m
     {[m
         "id": "plaguedoctor",[m
         "name": "Médecin de Peste",[m
[31m-        "ability": "Si vous mourrez, le Conteur gagne la capacité d'un Sbire pas en jeu.",[m
[32m+[m[32m        "ability": "Si vous mourrez, le Conteur gagne la capacité d'un Sbire.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[1mdiff --git a/assets/data/characters/he_IL.json b/assets/data/characters/he_IL.json[m
[1mindex b97bd49..9b15d99 100644[m
[1m--- a/assets/data/characters/he_IL.json[m
[1m+++ b/assets/data/characters/he_IL.json[m
[36m@@ -36,6 +36,15 @@[m
             "בוחר במוות"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "אלסאהיר",[m
[32m+[m[32m        "ability": "פעם ביום, אם אתה מנחש בפומבי אילו שחקנים הם מיניונים ואיזה שדים, מנצח טוב.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "אמנזי",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "מפריח הבלונים",[m
[31m-        "ability": "בכל לילה, אתה לומד שחקן אחד מכל סוג דמות, עד שאין יותר סוגים ללמוד (תושב-עיירה, זר, משרת, שד). [+1 זר]",[m
[32m+[m[32m        "ability": "בכל לילה, אתה לומד שחקן אחד מכל סוג דמות, עד שאין יותר סוגים ללמוד (תושב-עיירה, זר, משרת, שד). [+0 או +1 זר]",[m
         "firstNightReminder": "בחר סוג דמות. הצבע על שחקן שדמותו מהסוג הנבחר. הנח את אסימון ה\"נראה\" של מפריח הבלונים ליד הדמות הזו.",[m
         "otherNightReminder": "בחר סוג דמות שאין אסימון \"נראה\" ליד דמות מהסוג הזה כבר. הצבע על שחקן שדמותו מהסוג הנבחר, אם נשארו כאלה. הנח את אסימון ה\"נראה\" של מפריח הבלונים ליד הדמות הזו,.",[m
         "remindersGlobal": [],[m
[36m@@ -1083,7 +1092,9 @@[m
         "firstNightReminder": "העוף מצביע על שחקן (לא על עצמם) והופך למערך שלו.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "חבר"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/it_IT.json b/assets/data/characters/it_IT.json[m
[1mindex b0c44a0..7b3a5a6 100644[m
[1m--- a/assets/data/characters/it_IT.json[m
[1m+++ b/assets/data/characters/it_IT.json[m
[36m@@ -30,6 +30,15 @@[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsahir",[m
[32m+[m[32m        "ability": "Una volta al giorno, se indovini pubblicamente quali giocatori sono Minion e quali Demoni, vince il buono.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Smemorato",[m
[36m@@ -96,7 +105,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Aeronauta",[m
[31m-        "ability": "Ogni notte, apprendi 1 giocatore per ogni tipo (es. Giocatore 1 / Cittadino, Giocatore 2 / Seguace, ...), finché non ci sono più tipi da apprendere. [+1 Forestiero]",[m
[32m+[m[32m        "ability": "Ogni notte, apprendi 1 giocatore per ogni tipo (es. Giocatore 1 / Cittadino, Giocatore 2 / Seguace, ...), finché non ci sono più tipi da apprendere. [+0 oppure +1 Forestiero]",[m
         "firstNightReminder": "Scegli un tipo (es. Cittadino). Indica un giocatore che è di quel tipo. Affiancagli il promemoria \"Visto\" di quel tipo.",[m
         "otherNightReminder": "Scegli un tipo non ancora visto (es. Seguace). Indica un giocatore che è di quel tipo. Affiancagli il promemoria \"Visto\" di quel tipo.",[m
         "remindersGlobal": [],[m
[36m@@ -1084,7 +1093,9 @@[m
         "firstNightReminder": "L'Orco indica un giocatore (non se stesso) e diventa il suo allineamento.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Amico"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/ja_JP.json b/assets/data/characters/ja_JP.json[m
[1mindex 5f6cb7b..5a42722 100644[m
[1m--- a/assets/data/characters/ja_JP.json[m
[1m+++ b/assets/data/characters/ja_JP.json[m
[36m@@ -36,6 +36,15 @@[m
             "生を選んだ"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "アルサーヒル",[m
[32m+[m[32m        "ability": "1 日に 1 回、どのプレイヤーがミニオンでどのプレイヤーがデーモンかを公に推測すると、善が勝ちます。",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "記憶喪失",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "気球奏者",[m
[31m-        "ability": "毎晩、学習するタイプがなくなるまで、各キャラクター タイプのプレイヤー 1 人を学習します。 [+1 部外者]",[m
[32m+[m[32m        "ability": "毎晩、学習するタイプがなくなるまで、各キャラクター タイプのプレイヤー 1 人を学習します。 〔よそ者＋0または＋1〕",[m
         "firstNightReminder": "文字の種類を選択します。そのタイプのキャラクターを持つプレイヤーを指します。そのキャラクターの隣に気球奏者の「Seen」リマインダーを配置します。",[m
         "otherNightReminder": "そのタイプのキャラクターの横に「Seen」リマインダーがまだないキャラクタータイプを選択してください。そのタイプのキャラクターを持つプレイヤーがいる場合は、それを指します。そのキャラクターの隣に気球奏者の「Seen」リマインダーを配置します。",[m
         "remindersGlobal": [],[m
[36m@@ -1083,7 +1092,9 @@[m
         "firstNightReminder": "鬼はプレイヤー (自分自身ではない) を指し、そのプレイヤーの配置となります。",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "友達"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/kv_KV.json b/assets/data/characters/kv_KV.json[m
[1mindex af9b565..2105d4a 100644[m
[1m--- a/assets/data/characters/kv_KV.json[m
[1m+++ b/assets/data/characters/kv_KV.json[m
[36m@@ -36,6 +36,15 @@[m
             "Выбрал смерть"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Once per day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Амнезиак",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Аэронавт",[m
[31m-        "ability": "Каждую ночью вам показывают 1-го игрока из каждого класса ролей (Местные, Аутсайдеры, Приспешники, Демон), с случайном порядке. [+1 Аутсайдер]",[m
[32m+[m[32m        "ability": "Каждую ночью вам показывают 1-го игрока из каждого класса ролей (Местные, Аутсайдеры, Приспешники, Демон), с случайном порядке. [+0 или +1 Аутсайдер]",[m
         "firstNightReminder": "Выберите класс ролей. Укажите на игрока, чья роль принадлежит к этому классу. Положите рядом с этой ролью напоминающий жетон \"Видел _\".",[m
         "otherNightReminder": "Выберите класс ролей, роли в котором еще не были отмечены жетоном \"Видел _\". Укажите на игрока, чья роль принадлежит к этому классу, если такой имеется. Положите рядом с этой ролью напоминающий жетон \"Видел _\".",[m
         "remindersGlobal": [],[m
[36m@@ -1093,7 +1102,9 @@[m
         "firstNightReminder": "The Ogre points to a player (not themselves) and becomes their alignment.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Friend"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/nb_NO.json b/assets/data/characters/nb_NO.json[m
[1mindex ecde68f..10979d9 100644[m
[1m--- a/assets/data/characters/nb_NO.json[m
[1m+++ b/assets/data/characters/nb_NO.json[m
[36m@@ -36,6 +36,15 @@[m
             "Valgte livet"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsahir",[m
[32m+[m[32m        "ability": "En gang om dagen, hvis du offentlig gjetter hvilke spillere som er Minion(er) og hvilke som er Demon(er), gode gevinster.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Forglemt",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Ballongfarer",[m
[31m-        "ability": "Hver natt, lær 1 spiller av hver rolletype, til det ikke er flere typer å lære igjen. [+1 Einstøing]",[m
[32m+[m[32m        "ability": "Hver natt, lær 1 spiller av hver rolletype, til det ikke er flere typer å lære igjen. [+0 eller +1 Einstøing]",[m
         "firstNightReminder": "Velg en rolletype. Pek mot en spiller som har en rolle av den typen. Marker spilleren med \"Sett\"-påminnelsen.",[m
         "otherNightReminder": "Velg en rolletype som ikke allerede har en \"Sett\"-påminnelse ved siden av en rolle av denne typen. Pek mot en spiller som har en rolle av den typen. Marker spilleren med \"Sett\"-påminnelsen.",[m
         "remindersGlobal": [],[m
[36m@@ -1084,7 +1093,9 @@[m
         "firstNightReminder": "Ogre peker på en spiller (ikke seg selv) og blir deres justering.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Venn"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/nn_NO.json b/assets/data/characters/nn_NO.json[m
[1mindex f3f3b32..9b79efe 100644[m
[1m--- a/assets/data/characters/nn_NO.json[m
[1m+++ b/assets/data/characters/nn_NO.json[m
[36m@@ -36,6 +36,15 @@[m
             "Valde livet"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsahir",[m
[32m+[m[32m        "ability": "En gang om dagen, hvis du offentlig gjetter hvilke spillere som er Minion(er) og hvilke som er Demon(er), gode gevinster.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Forgløymd",[m
[36m@@ -105,7 +114,7 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Ballongfarar",[m
[31m-        "ability": "Kvar natt, lær 1 spelar av kvar rolletype, til det ikkje er fleire typar å lære att. [+1 Einstøing]",[m
[32m+[m[32m        "ability": "Kvar natt, lær 1 spelar av kvar rolletype, til det ikkje er fleire typar å lære att. [+0 eller +1 Einstøing]",[m
         "firstNightReminder": "Vel ein rolletype. Peik mot ein spelar som har ei rolle av den typen. Marker spelaren med \"Sett\"-påminninga.",[m
         "otherNightReminder": "Vel ein rolletype som ikkje allereie har ei \"Sett\"-påminning attmed ei rolle av denne typen. Peik mot ein spelar som har ei rolle av den typen. Marker spelaren med \"Sett\"-påminninga.",[m
         "remindersGlobal": [],[m
[36m@@ -1084,7 +1093,9 @@[m
         "firstNightReminder": "Ogre peker på en spiller (ikke seg selv) og blir deres justering.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Venn"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[1mdiff --git a/assets/data/characters/pt_BR.json b/assets/data/characters/pt_BR.json[m
[1mindex b8d5690..7ad79cd 100644[m
[1m--- a/assets/data/characters/pt_BR.json[m
[1m+++ b/assets/data/characters/pt_BR.json[m
[36m@@ -36,6 +36,15 @@[m
             "Vida"[m
         ][m
     },[m
[32m+[m[32m    {[m
[32m+[m[32m        "id": "alsaahir",[m
[32m+[m[32m        "name": "Alsaahir",[m
[32m+[m[32m        "ability": "Uma vez por dia, se você publicamente adivinhar quais jogadores são Lacaio(s) e quais são Demônio(s), o bem vence.",[m
[32m+[m[32m        "firstNightReminder": "",[m
[32m+[m[32m        "otherNightReminder": "",[m
[32m+[m[32m        "remindersGlobal": [],[m
[32m+[m[32m        "reminders": [][m
[32m+[m[32m    },[m
     {[m
         "id": "amnesiac",[m
         "name": "Esquecido",[m
[36m@@ -62,7 +71,7 @@[m
     {[m
         "id": "apprentice",[m
         "name": "Aprendiz",[m
[31m-        "ability": "Na sua primeira noite, você ganha uma habilidade de Cidadão (se for do bem), ou de Lacaio (se for do mal).",[m
[32m+[m[32m        "ability": "Na sua 1ª noite, você ganha uma habilidade de Cidadão (se for do bem), ou de Lacaio (se for do mal).",[m
         "firstNightReminder": "Mostre ao Aprendiz o token 'Você é', e um token de Cidadão ou Lacaio. No Grimório, substitua o token do Aprendiz com o daquele personagem e coloque o lembrete 'É o Aprendiz' próximo a ele.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -86,7 +95,7 @@[m
         "name": "Assassino",[m
         "ability": "Uma vez por jogo, à noite*, escolha um jogador: ele morre mesmo que, por alguma razão, não possa morrer.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se o Assassino ainda não usou a habilidade: o Assassino pode sinalizar 'não' com a cabeça, ou escolher um jogador: o alvo morre, mesmo que algo impeça isso.",[m
[32m+[m[32m        "otherNightReminder": "Se o Assassino não estiver marcado com o token *SEM HABILIDADE*, Assassino pode escolher um jogador. :reminder: :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto",[m
[36m@@ -105,9 +114,9 @@[m
     {[m
         "id": "balloonist",[m
         "name": "Balonista",[m
[31m-        "ability": "A cada noite, saiba um jogador de um tipo de personagem diferente, até que você saiba um jogador para cada tipo de personagem possível. [+1 Forasteiro]",[m
[31m-        "firstNightReminder": "Escolha um tipo de personagem. Aponte para um jogador cujo personagem é desse tipo. Coloque o lembrete 'Visto' do Balonista ao lado desse personagem.",[m
[31m-        "otherNightReminder": "Escolha um tipo de personagem que você ainda não escolheu. Informe ao Balonista um jogador cujo personagem é desse tipo, se houver algum. Coloque o lembrete 'Visto' do Balonista ao lado desse personagem.",[m
[32m+[m[32m        "ability": "A cada noite, saiba um jogador de um tipo de personagem diferente da última noite. [+0 ou +1 Forasteiro]",[m
[32m+[m[32m        "firstNightReminder": "Mostre qualquer jogador. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "Aponte para um jogador que tenha um tipo personagem diferente do anterior. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Cidadão Visto",[m
[36m@@ -133,7 +142,7 @@[m
         "name": "Barbeiro",[m
         "ability": "Se você morreu hoje, o Demônio poderá escolher dois jogadores (exceto outro Demônio): eles trocam de personagens entre si.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se o Barbeiro morreu hoje: Acorde o Demônio. Mostre o token 'Você foi alvo desta habilidade' e o token do Barbeiro. O Demônio pode recusar usar a habilidade do Barbeiro ou escolher 2 jogadores que não sejam Demônio. Se ele escolher jogadores: Troque as fichas de personagem dos alvos. Acorde cada jogador escolhido. Informe-os quais são seus novos personagens.",[m
[32m+[m[32m        "otherNightReminder": "\"Se o Barbeiro morreu, imediatamente acorde o Demônio. Mostre o token *ESSE PERSONAGEM TE ESCOLHEU* & o token de personagem do Barbeiro. Se o Demônio escolheu 2 jogadores, acorde um de cada vez. Mostre os tokens *VOCÊ É* e o token de seu novo personagem. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Cortes de Cabelo hoje"[m
[36m@@ -142,9 +151,9 @@[m
     {[m
         "id": "barista",[m
         "name": "Barista",[m
[31m-        "ability": "A cada noite, até o anoitecer, 1) um jogador fica sóbrio, desenvenenado e ganha informações verdadeiras, ou 2) a habilidade de um jogador funciona 2x. O jogador afetado sabe o efeito.",[m
[31m-        "firstNightReminder": "Escolha um jogador, acorde-o e mostre-o qual poder do Barista o está afetando (1 ou 2).",[m
[31m-        "otherNightReminder": "Escolha um jogador, acorde-o e mostre-o qual poder do Barista o está afetando (1 ou 2).",[m
[32m+[m[32m        "ability": "A cada noite, até o anoitecer: 1) Um jogador fica são, sóbrio e saudável e obtém informações verdadeiras, ou; 2) Uma habilidade funciona duas vezes. O jogador afetado sabe qual é o efeito.",[m
[32m+[m[32m        "firstNightReminder": "Escolha um jogador, acorde-o e informe-o qual dos poderes da Barista está o afetando. Trate-o da forma correspondente (sóbrio, são e informação verdadeira ou ative a habilidade duas vezes)",[m
[32m+[m[32m        "otherNightReminder": "Escolha um jogador, acorde-o e informe-o qual dos poderes da Barista está o afetando. Trate-o da forma correspondente (sóbrio, são e informação verdadeira ou ative a habilidade duas vezes)",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Habilidade 2x",[m
[36m@@ -163,7 +172,7 @@[m
     {[m
         "id": "beggar",[m
         "name": "Pedinte",[m
[31m-        "ability": "Você precisa de um token de voto para votar. Jogadores mortos podem escolher doar os deles a você. Caso o façam, saiba o alinhamento deles.",[m
[32m+[m[32m        "ability": "Você precisa de um token de voto para votar. Jogadores mortos podem escolher doar os deles a você. Caso o façam, saiba o alinhamento deles. Você está são & sóbrio",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -186,7 +195,7 @@[m
         "name": "Coletor de Ossos",[m
         "ability": "Uma vez por jogo, à noite, escolha um jogador morto: ele recupera a habilidade até o anoitecer.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "O Coletor de Ossos pode sinalizar 'não' com a cabeça ou apontar para um jogador morto. Se apontar para um jogador morto, marque o alvo com o token 'Tem habilidade' e marque o Coletor de Ossos com o token 'Sem habilidade'.",[m
[32m+[m[32m        "otherNightReminder": "Se não estiver marcado com *SEM HABILIDADE*, o Coletor de Ossos faz 'não' com a cabeça ou aponta para um jogador morto. Se apontou para um morto coloque o marcador *TEM HABILIDADE* sobre o token do jogador escolhido. (ele talvez precise ser acordado essa noite para utiliza-la.)",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Sem habilidade",[m
[36m@@ -214,9 +223,9 @@[m
     {[m
         "id": "bountyhunter",[m
         "name": "Mercenário",[m
[31m-        "ability": "Você começa o jogo sabendo 1 jogador do mal. Quando esse jogador morrer, saiba outro jogador do mal esta noite. [1 Cidadão é do mal]",[m
[31m-        "firstNightReminder": "Aponte para 1 jogador mau. Acorde o Cidadão mau e mostre o token 'Você é' e sinalize 'mau' (polegar para baixo).",[m
[31m-        "otherNightReminder": "Se o alvo morreu, aponte para outro jogador mau.",[m
[32m+[m[32m        "ability": "\"Você começa sabendo 1 jogador do mal. Se esse jogador morrer, saiba outro jogador do mal esta noite. [1 Cidadão é do mal]",[m
[32m+[m[32m        "firstNightReminder": "Aponte para o jogador marcado com *ALVO*.",[m
[32m+[m[32m        "otherNightReminder": "Se o *ALVO* do Mercenário morreu desde a noite anterior, aponte para o novo *ALVO*.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Alvo"[m
[36m@@ -278,8 +287,8 @@[m
         "id": "cerenovus",[m
         "name": "Cerenovus",[m
         "ability": "A cada noite, escolha um personagem do bem e um jogador: ele deve alucinar ser esse personagem amanhã, ou pode ser executado.",[m
[31m-        "firstNightReminder": "O Cerenovus escolhe um jogador e um personagem bom. (lembrete) Coloque o Cerenovus para dormir. Acorde o alvo. Mostre o token 'Você foi alvo desta habilidade', o token do Cerenovus e o token do personagem escolhido.",[m
[31m-        "otherNightReminder": "O Cerenovus escolhe um jogador e um personagem bom. (lembrete) Coloque o Cerenovus para dormir. Acorde o alvo. Mostre o token 'Você foi alvo desta habilidade', o token do Cerenovus e o token do personagem escolhido.",[m
[32m+[m[32m        "firstNightReminder": "O Cerenovus escolhe um jogador e um personagem bom. :reminder: Coloque o Cerenovus para dormir. Acorde esse jogador. Mostre o token *ESSE PERSONAGEM TE ESCOLHEU* e os tokens de personagens do Cerenovus e do personagem escolhido por ele.",[m
[32m+[m[32m        "otherNightReminder": "O Cerenovus escolhe um jogador e um personagem bom. :reminder: Coloque o Cerenovus para dormir. Acorde esse jogador. Mostre o token *ESSE PERSONAGEM TE ESCOLHEU* e os tokens de personagens do Cerenovus e do personagem escolhido por ele.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Alucinando"[m
[36m@@ -289,8 +298,8 @@[m
         "id": "chambermaid",[m
         "name": "Camareira",[m
         "ability": "A cada noite, escolha 2 jogadores vivos (exceto você): saiba quantos deles acordaram esta noite pelas próprias habilidades.",[m
[31m-        "firstNightReminder": "A Camareira aponta para dois jogadores vivos. Mostre com os dedos o número que indica quantos desses dois acordaram esta noite pelas próprias habilidades.",[m
[31m-        "otherNightReminder": "A Camareira aponta para dois jogadores vivos. Mostre com os dedos o número que indica quantos desses dois acordaram esta noite pelas próprias habilidades.",[m
[32m+[m[32m        "firstNightReminder": "A Camareira escolhe outros dois jogadores vivos. Faça um número com os dedos.",[m
[32m+[m[32m        "otherNightReminder": "A Camareira escolhe outros dois jogadores vivos. Faça um número com os dedos.",[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
[36m@@ -323,10 +332,10 @@[m
     },[m
     {[m
         "id": "courtier",[m
[31m-        "name": "Cortesão",[m
[32m+[m[32m        "name": "Cortesã",[m
         "ability": "Uma vez por jogo, à noite, escolha um personagem: ele fica bêbado por 3 noites e 3 dias.",[m
[31m-        "firstNightReminder": "O Cortesão pode sinalizar 'não' com a cabeça, ou apontar para um personagem na ficha. Se o Cortesão usou a habilidade, e o personagem estiver em jogo, o alvo fica bêbado.",[m
[31m-        "otherNightReminder": "Reduza a quantidade de dias restantes do jogador bêbado. Se o Cortesão ainda não usou a habilidade: O Cortesão pode sinalizar 'não' com a cabeça, ou apontar para um personagem na ficha. Se o Cortesão usou a habilidade, e o personagem estiver em jogo, o alvo fica bêbado.",[m
[32m+[m[32m        "firstNightReminder": "A Cortesã pode escolher um personagem. :reminder: :reminder:",[m
[32m+[m[32m        "otherNightReminder": "Se a Cortesã não estiver com o token *SEM HABILIDADE*, pode escolher um personagem. :reminder: :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Bêbado 1",[m
[36m@@ -368,7 +377,7 @@[m
     },[m
     {[m
         "id": "deviant",[m
[31m-        "name": "Esquisito",[m
[32m+[m[32m        "name": "Desviado",[m
         "ability": "Se você foi divertido hoje, não pode morrer por exílio.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
[36m@@ -378,9 +387,9 @@[m
     {[m
         "id": "devilsadvocate",[m
         "name": "Advogado do Diabo",[m
[31m-        "ability": "A cada noite, escolha um jogador vivo (exceto o da anterior): se ele for executado amanhã, não morrerá.",[m
[31m-        "firstNightReminder": "O Advogado do Diabo aponta para um jogador vivo: o alvo sobrevive à execução amanhã.",[m
[31m-        "otherNightReminder": "O Advogado do Diabo aponta para um jogador vivo, diferente do alvo da noite anterior: Esse jogador sobrevive à execução amanhã.",[m
[32m+[m[32m        "ability": "A cada noite, escolha um jogador vivo (exceto o da noite anterior): se ele for executado amanhã, não morrerá.",[m
[32m+[m[32m        "firstNightReminder": "O Advogado do Diabo escolhe um jogador vivo. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "O Advogado do Diabo escolhe um jogador vivo (diferente do escolhido na noite anterior). :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Sobrevive à execução"[m
[36m@@ -397,7 +406,7 @@[m
     },[m
     {[m
         "id": "doomsayer",[m
[31m-        "name": "Agoureiro",[m
[32m+[m[32m        "name": "Apocalíptico",[m
         "ability": "Se 4 ou mais jogadores estiverm vivos, cada jogador vivo pode (uma vez por jogo) pedir que um jogador do mesmo alinhamento morra.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
[36m@@ -407,7 +416,7 @@[m
     {[m
         "id": "dreamer",[m
         "name": "Sonhador",[m
[31m-        "ability": "A cada noite, escolha um jogador (exceto você ou Viajantes): saiba 1 personagem do bem e 1 do mal, um deles é o correto.",[m
[32m+[m[32m        "ability": "A cada noite, escolha um jogador (exceto você ou Viajantes): saiba 1 personagem do bem e 1 do mal, um deles corresponde ao jogador escolhido.",[m
         "firstNightReminder": "O Sonhador escolhe um jogador. Mostre 1 personagem do bem e 1 do mal, sendo 1 deles o personagem do jogador escolhido.",[m
         "otherNightReminder": "O Sonhador escolhe um jogador. Mostre 1 personagem do bem e 1 do mal, sendo 1 deles o personagem do jogador escolhido.",[m
         "remindersGlobal": [],[m
[36m@@ -459,7 +468,7 @@[m
     {[m
         "id": "eviltwin",[m
         "name": "Gêmea Má",[m
[31m-        "ability": "Você e um oponente se conhecem. Se o jogador do bem for executado, o Mal vence. O Bem não pode vencer enquanto ambos viverem.",[m
[32m+[m[32m        "ability": "Você e um oponente se conhecem e sabem o personagem um do outro. Se o jogador do bem for executado, o Mal vence. O Bem não pode vencer enquanto ambos viverem.",[m
         "firstNightReminder": "Acorde as gêmeas. Deixe que façam contato visual. Mostre o token de personagem da Gêmea Má para sua gêmea e vice-versa.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -472,7 +481,7 @@[m
         "name": "Exorcista",[m
         "ability": "A cada noite*, escolha um jogador (exceto o da noite anterior): o Demônio, se escolhido, sabe quem você é e não age esta noite.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "O Exorcista aponta para um jogador (diferente do escolhido na noite anterior). Se esse jogador é o Demônio: acorde o Demônio. Mostre o token de personagem do Exorcista. Aponte para o jogador Exorcista. O Demônio não age esta noite.",[m
[32m+[m[32m        "otherNightReminder": "O Exorcista escolhe um jogador (diferente do escolhido na noite anterior). :reminder: Coloque-o para dormir. Se esse jogador for o Demônio: Acorde o Demônio. Mostre o token *ESSE PERSONAGEM ESCOLHEU VOCÊ* & o token de personagem do Exorcista. Aponte para o Exorcista.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Escolhido"[m
[36m@@ -483,7 +492,7 @@[m
         "name": "Fang Gu",[m
         "ability": "A cada noite*, você escolhe um jogador: ele morre. O primeiro Forasteiro a ser morto assim, torna-se um Fang Gu do mal e você morre em vez dele. [+1 Forasteiro]",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "O Fang Gu escolhe um jogador. O alvo morre. Ou, se esse jogador for o Primeiro Forasteiro escolhido por um Fang Gu no Jogo: • O Fang Gu morre em vez do alvo. O alvo agora é um Fang Gu mau. • Acorde o novo Fang Gu. Informe-o que ele é um Fang Gu mau. Esta troca não poderá mais acontecer durante este jogo.",[m
[32m+[m[32m        "otherNightReminder": "O Fang Gu escolhe um jogador. :reminder: Se este jogador for um Forasteiro (apenas uma vez): Substitua o token de Forasteiro com um token de Fang Gu sobrando. Coloque o Fang Gu para dormir. Acorde o alvo. Mostre os tokens *VOCÊ É* e do Fang Gu & mostre um joinha para baixo. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto"[m
[36m@@ -545,7 +554,7 @@[m
         "name": "Florista",[m
         "ability": "A cada noite*, saiba se um Demônio votou hoje.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Sinalize 'sim' ou 'não' com a cabeça para indicar se o Demônio votou. Coloque o lembrete 'Demônio não votou' (remova 'Demônio votou', se for o caso).",[m
[32m+[m[32m        "otherNightReminder": "Sinalize com a cabeça (sim ou não).",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Demônio não votou",[m
[36m@@ -566,9 +575,9 @@[m
     {[m
         "id": "fortuneteller",[m
         "name": "Vidente",[m
[31m-        "ability": "A cada noite, escolha 2 jogadores: saiba se algum deles é um Demônio. Há um jogador do bem que é registrado como Demônio para você.",[m
[31m-        "firstNightReminder": "A Vidente escolhe dois jogadores. Sinalize com a cabeça (sim ou não) para indicar se algum destes jogadores é o Demônio (ou a *PISTA FALSA*).",[m
[31m-        "otherNightReminder": "A Vidente escolhe dois jogadores. Sinalize com a cabeça (sim ou não) para indicar se algum destes jogadores é o Demônio (ou a *PISTA FALSA*).",[m
[32m+[m[32m        "ability": "A cada noite, escolha 2 jogadores: saiba se dentre eles há um Demônio. Há um jogador do bem que é registrado como Demônio para você.",[m
[32m+[m[32m        "firstNightReminder": "A Vidente escolhe dois jogadores. Sinalize com a cabeça (sim ou não) para indicar se algum destes jogadores é um Demônio (ou a *PISTA FALSA*).",[m
[32m+[m[32m        "otherNightReminder": "A Vidente escolhe dois jogadores. Sinalize com a cabeça (sim ou não) para indicar se algum destes jogadores é um Demônio (ou a *PISTA FALSA*).",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Pista Falsa"[m
[36m@@ -579,7 +588,7 @@[m
         "name": "Apostador",[m
         "ability": "A cada noite*, escolha um jogador e tente adivinhar o personagem dele: se errar, você morre.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "O Apostador aponta para um jogador e para um personagem na ficha. Se o personagem não corresponder ao jogador escolhido, o Apostador morre.",[m
[32m+[m[32m        "otherNightReminder": "O Apostador escolhe um jogador & um personagem. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto"[m
[36m@@ -598,8 +607,8 @@[m
         "id": "general",[m
         "name": "General",[m
         "ability": "A cada noite, saiba qual time o Narrador acredita que está vencendo: Bem, Mal ou nenhum.",[m
[31m-        "firstNightReminder": "Informe ao General qual time você acha que está vencendo usando seu polegar: Bem (polegar para cima), Mal (polegar para baixo) ou nenhum (polegar para o lado).",[m
[31m-        "otherNightReminder": "Informe ao General qual time você acha que está vencendo usando seu polegar: Bem (polegar para cima), Mal (polegar para baixo) ou nenhum (polegar para o lado).",[m
[32m+[m[32m        "firstNightReminder": "Faça um joinha em alguma direção.",[m
[32m+[m[32m        "otherNightReminder": "Faça um joinha em alguma direção.",[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
[36m@@ -619,7 +628,7 @@[m
         "name": "Mafioso",[m
         "ability": "Você começa sabendo quais Forasteiros estão em jogo. Se um Forasteiro morreu hoje de dia, escolha um jogador esta noite: o alvo morre. [−1 ou +1 Forasteiro]",[m
         "firstNightReminder": "Mostre cada token de Forasteiro em jogo.",[m
[31m-        "otherNightReminder": "Se um Forasteiro morreu hoje durante o dia: O Chefe da Máfia aponta para um jogador. Esse jogador morre.",[m
[32m+[m[32m        "otherNightReminder": "Se um Forasteiro morreu hoje, o Mafioso escolhe um jogador. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morreu de dia",[m
[36m@@ -653,7 +662,7 @@[m
         "name": "Fofoqueiro",[m
         "ability": "A cada dia, você pode fazer uma alegação publicamente. Esta noite, se a alegação era verdadeira, um jogador morre.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se a alegação pública do Fofoqueiro era verdadeira: mate um jogador",[m
[32m+[m[32m        "otherNightReminder": "Se o Fofoqueiro está prestes a matar um jogador, ele morre. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto"[m
[36m@@ -662,7 +671,7 @@[m
     {[m
         "id": "grandmother",[m
         "name": "Vovó",[m
[31m-        "ability": "Você começa sabendo o personagem de um jogador do bem. Se o Demônio matá-lo, você também morre.",[m
[32m+[m[32m        "ability": "Você começa sabendo o personagem de um jogador do bem específico. Se o Demônio matá-lo, você também morre.",[m
         "firstNightReminder": "Mostre o token de personagem do jogador marcado como 'Neto'. Aponte para o jogador marcado.",[m
         "otherNightReminder": "Se o 'Neto' da Vovó foi morto pelo Demônio esta noite: A Vovó morre.",[m
         "remindersGlobal": [],[m
[36m@@ -684,7 +693,7 @@[m
         "name": "Meretriz",[m
         "ability": "A cada noite*, escolha um jogador vivo: se ele concordar, saiba o personagem dele, mas ambos podem morrer.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "A Meretriz aponta para um jogador. Adormeça a Meretriz e acorde o alvo. Mostre o token 'Você foi alvo desta habilidade' e o token da Meretriz. O jogar pode sinalizar 'sim' ou 'não' com a cabeça. Se o alvo sinalizou 'sim', Acorde a Meretriz e mostre o token de personagem do alvo. Então decida se ambos morrem.",[m
[32m+[m[32m        "otherNightReminder": "A Meretriz escolhe um jogador, Coloque-o para dormir. Acorde o jogador escolhido, mostre os tokens *ESSE PERSONAGEM TE ESCOLHEU* e o da Meretriz, ele pode com a cabeça escolher 'sim' ou 'não'. Se sim acorde a Meretriz e mostre o token de personagem do jogador escolhido. Então, você decide se ambos ou nenhum morre.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto"[m
[36m@@ -693,7 +702,7 @@[m
     {[m
         "id": "harpy",[m
         "name": "Harpia",[m
[31m-        "ability": "A cada noite, escolha 2 jogadores: amanhã o 1º alucina que o 2º é do mal, ou ambos podem morrer.",[m
[32m+[m[32m        "ability": "A cada Noite, escolha 2 jogadores: amanhã o 1º alucina que o 2º é do mal, ou um ou ambos podem morrer.",[m
         "firstNightReminder": "Acorde a Harpia; ela aponta para um jogador, depois outro. Acorde o 1º jogador que a Harpia apontou, mostre o token 'Você foi alvo desta habilidade' e o token da Harpia, aponte para o 2º jogador escolhido.",[m
         "otherNightReminder": "Acorde a Harpia; ela aponta para um jogador, depois outro. Acorde o 1º jogador que a Harpia apontou, mostre o token 'Você foi alvo desta habilidade' e o token da Harpia, aponte para o 2º jogador escolhido.",[m
         "remindersGlobal": [],[m
[36m@@ -769,7 +778,7 @@[m
         "name": "Taverneiro",[m
         "ability": "A cada noite*, escolha 2 jogadores: eles não podem morrer esta noite, mas um deles fica bêbado até o anoitecer.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Remova os tokens de 'Protegido' e 'Bêbado'. O Estalajadeiro aponta 2 jogadores. Os alvos ficam protegidos da morte esta noite.Escolha um para marcar com o lembrete 'Bêbado'.",[m
[32m+[m[32m        "otherNightReminder": "O Estalajadeiro escolhe 2 jogadores. :reminder: :reminder: :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Bêbado",[m
[36m@@ -802,9 +811,9 @@[m
     {[m
         "id": "juggler",[m
         "name": "Malabarista",[m
[31m-        "ability": "Em seu primeiro dia, você pode tentar adivinhar publicamente até 5 personagens de até 5 jogadores. Á noite, você descobre quantos você acertou.",[m
[32m+[m[32m        "ability": "Em seu primeiro dia, você pode tentar adivinhar publicamente até 5 personagens de até 5 jogadores. À noite, você descobre quantos você acertou.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se hoje foi o primeiro dia do Malabarista e este usou sua habilidade:Mostre com os dedos o número de acertos.",[m
[32m+[m[32m        "otherNightReminder": "Faça um número com os dedos.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Correto"[m
[36m@@ -824,9 +833,9 @@[m
     {[m
         "id": "king",[m
         "name": "Rei",[m
[31m-        "ability": "A cada noite, se os mortos são maioria, saiba um personagem vivo. O Demônio conhece você.",[m
[31m-        "firstNightReminder": "Acorde o Demônio, mostre o token do Rei e aponte para o jogador correspondente.",[m
[31m-        "otherNightReminder": "Se a maioria dos jogadores está morta, mostre oao rei o token de um personagem vivo.",[m
[32m+[m[32m        "ability": "A cada noite, se os vivos não são maioria, saiba um personagem vivo. O Demônio sabe quem você é.",[m
[32m+[m[32m        "firstNightReminder": "Acorde o Demônio, mostre os tokens *ESSE JOGADOR É* e do Rei e aponte para o Rei.",[m
[32m+[m[32m        "otherNightReminder": "Se os vivos não são maioria, mostre ao Rei o token de personagem de um jogador vivo.",[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
[36m@@ -871,19 +880,19 @@[m
         "otherNightReminder": "Coloque o lembrete com o número do dia que irá amanhecer. Se ainda não anunciou que o Leviatã está em jogo, faça isso ao amanhcer, anunciando também o número correspondente ao dia.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
[32m+[m[32m            "Bom Executado",[m
             "Dia 1",[m
             "Dia 2",[m
             "Dia 3",[m
             "Dia 4",[m
[31m-            "Dia 5",[m
[31m-            "Bom Executado"[m
[32m+[m[32m            "Dia 5"[m
         ][m
     },[m
     {[m
         "id": "librarian",[m
         "name": "Bibliotecária",[m
         "ability": "Você começa sabendo que 1 dentre 2 jogadores é um Forasteiro específico.(Ou que há 'zero' Forasteiros em jogo.)",[m
[31m-        "firstNightReminder": "Mostre o token de personagem de um Forasteiro em jogo. Aponte para dois jogadores, um que é esse personagem.",[m
[32m+[m[32m        "firstNightReminder": "Mostre o token de personagem Forasteiro. Aponte para os jogadores *FORASTEIRO* e *ERRADO*.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
         "reminders": [[m
[36m@@ -894,7 +903,7 @@[m
     {[m
         "id": "lilmonsta",[m
         "name": "Monstrinho",[m
[31m-        "ability": "A cada noite os Lacaios escolhem quem cuidará do Monstrinho e \"é o Demônio\". A cada noite*, um jogador morre. [+1 Lacaio]",[m
[32m+[m[32m        "ability": "A cada noite os Lacaios escolhem quem cuidará do Monstrinho e 'é o Demônio'. A cada noite* um jogador pode morrer. [+1 Lacaio]",[m
         "firstNightReminder": "Acorde todos os Lacaios juntos, permita que eles votem apontando para quem eles querem que tome conta do Monstrinho.",[m
         "otherNightReminder": "Acorde todos os Lacaios juntos, permita que eles votem apontando para quem eles querem que tome conta do Monstrinho. Escolha um jogador, aquele jogador morre.",[m
         "remindersGlobal": [[m
[36m@@ -919,13 +928,11 @@[m
         "id": "lunatic",[m
         "name": "Lunático",[m
         "ability": "Você pensa que é um Demônio, mas você não é. O Demônio conhece você e quem você escolhe à noite.",[m
[31m-        "firstNightReminder": "Caso este jogo tenha etapa de informação do Demônio, realize esta etapa com o Lunático dando informações arbitrárias. Se o Demônio acordaria hoje para receber informações ou fazer escolhas, faça o mesmo com o Lunático (informações arbitrárias). Acorde o Demônio, Mostre o token do Lunático e aponte para o jogador correspondente. Informe quaisquer alvos que o Lunático tenha escolhido com sua habilidade falsa.",[m
[31m-        "otherNightReminder": "Se o Demônio acordaria hoje para receber informações ou fazer escolhas, faça o mesmo com o Lunático (informações arbitrárias). Acorde o Demônio e informe quaisquer alvos que o Lunático tenha escolhido com sua habilidade falsa.",[m
[32m+[m[32m        "firstNightReminder": "Caso este jogo tenha etapa de informação do Demônio: mostre ao Lunático o token *ESTE SÃO SEUS LACAIOS* e aponte para quaisquer jogadores. Mostre o token *ESSES PERSONAGENS NÃO ESTÃO EM JOGO* e 3 tokens de quaisquer personagens bons. Faça o que mais for necessário para simular o Demônio agindo e coloque-o para dormir. Acorde o Demônio, mostre-o token *VOCÊ É* seguido do token de seu personagem. Aponte para o Lunático e mostre o token *ESSE JOGADOR É* e o token de personagem do Lunático. Aponte para os jogadores com o marcador *ESCOLHIDO* se houver",[m
[32m+[m[32m        "otherNightReminder": "Faça o que mais for necessário para simular o Demônio agindo. Coloque o Lunático para dormir. Acorde o Demônio. Mostre o token de Lunático & aponte para ele e seu(s) alvo(s).",[m
         "remindersGlobal": [],[m
         "reminders": [[m
[31m-            "Ataque 1",[m
[31m-            "Ataque 2",[m
[31m-            "Ataque 3"[m
[32m+[m[32m            "Escolhido"[m
         ][m
     },[m
     {[m
[36m@@ -1036,7 +1043,7 @@[m
         "name": "Filha da Lua",[m
         "ability": "Quando você souber que morreu, escolha publicamente 1 jogador vivo. Esta noite, se o jogador escolhido era do bem, ele morre.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se a Filha da Noite usou sua habilidade para escolher um jogador hoje: se esse jogador era bom, morre.",[m
[32m+[m[32m        "otherNightReminder": "Se a Filha da Noite está prestes a matar um jogador, ele morre. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Morto"[m
[36m@@ -1045,7 +1052,7 @@[m
     {[m
         "id": "mutant",[m
         "name": "Mutante",[m
[31m-        "ability": "Se você alucinar ser um Forasteiro, você pode ser executado.",[m
[32m+[m[32m        "ability": "Se você alucinar que é um Forasteiro, você pode ser executado.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -1066,7 +1073,7 @@[m
         "id": "noble",[m
         "name": "Nobre",[m
         "ability": "Você começa sabendo 3 jogadores. Exatamente 1 deles é do mal.",[m
[31m-        "firstNightReminder": "Aponte para 3 jogadores incluindo exatamente 1 do mal em qualquer ordem.",[m
[32m+[m[32m        "firstNightReminder": "Aponte para os 3 jogadores marcados com *VISTO*",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
         "reminders": [[m
[36m@@ -1092,7 +1099,9 @@[m
         "firstNightReminder": "O Ogro aponta para outro jogador e se torna seu alinhamento.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[31m-        "reminders": [][m
[32m+[m[32m        "reminders": [[m
[32m+[m[32m            "Amigo"[m
[32m+[m[32m        ][m
     },[m
     {[m
         "id": "ojo",[m
[36m@@ -1110,7 +1119,7 @@[m
         "name": "Oráculo",[m
         "ability": "A cada noite*, saiba quantos jogadores mortos são do mal.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Mostre com os dedos o número de jogadores maus mortos.",[m
[32m+[m[32m        "otherNightReminder": "Faça um número com os dedos.",[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
[36m@@ -1138,8 +1147,8 @@[m
         "id": "philosopher",[m
         "name": "Filósofo",[m
         "ability": "Uma vez por jogo, à noite, escolha um personagem do bem: ganhe aquela habilidade. Se esse personagem estiver em jogo, ele fica bêbado.",[m
[31m-        "firstNightReminder": "O Filósofo pode escolher um personagem. Se necessário, troque seu token de personagem. (lembrete)",[m
[31m-        "otherNightReminder": "O Filósofo pode escolher um personagem. Se necessário, troque seu token de personagem. (lembrete)",[m
[32m+[m[32m        "firstNightReminder": "O Filósofo pode escolher um personagem do bem, se necessário troque os tokens de personagens. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "O Filósofo pode escolher um personagem do bem, se necessário troque os tokens de personagens. :reminder:",[m
         "remindersGlobal": [[m
             "Bêbado",[m
             "É o Filósofo"[m
[36m@@ -1149,28 +1158,28 @@[m
     {[m
         "id": "pithag",[m
         "name": "Bruxa do Fosso",[m
[31m-        "ability": "A cada noite*, escolha um jogador para se tornar um novo personagem (não funciona se já estiver em jogo). Se o personagem escolhido for um Demônio, as mortes serão arbitrárias esta noite.",[m
[32m+[m[32m        "ability": "A cada noite*, escolha um jogador e um personagem para ele se tornar (se não estiver em jogo). Se um Demônio é criado, as mortes serão arbitrárias esta noite.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "A Bruxa do Fosso escolhe um jogador e um personagem. Se escolher um personagem que não está em jogo: Ponha a Bruxa do fosso para dormir. Acorde o alvo. Mostre o token: 'Você é' e o token de seu novo personagem.",[m
[32m+[m[32m        "otherNightReminder": "A Bruxa do Fosso escolhe um jogador & um personagem :reminder: Coloque a Bruxa do Fosso para dormir. Caso o personagem escolhido não esteja em jogo, acorde a pessoa esclhida mostre os tokens *VOCÊ É* & do personagem escolhido.",[m
         "remindersGlobal": [],[m
         "reminders": [][m
     },[m
     {[m
         "id": "pixie",[m
         "name": "Pixie",[m
[31m-        "ability": "Você começa sabendo um personagem Cidadão em jogo. Se você alucinar ser esse personagem, você ganha aquela habilidade quando ele morrer.",[m
[31m-        "firstNightReminder": "Mostre o token de um Cidadão que está em jogo.",[m
[32m+[m[32m        "ability": "Você começa o sabendo 1 Cidadão em jogo. Se você estava alucinando ser esse personagem, você ganha a habilidade dele quando ele morrer.",[m
[32m+[m[32m        "firstNightReminder": "Mostre-a o token de personagem do Cidadão marcado com *ALUCINANDO*.",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Alucinando",[m
[31m-            "Tem habilidade"[m
[32m+[m[32m            "Habilidade adquirida"[m
         ][m
     },[m
     {[m
         "id": "plaguedoctor",[m
         "name": "Médico da Peste",[m
[31m-        "ability": "Se você morrer, o Narrador recebe a habilidade de um Lacaio que não está em jogo.",[m
[32m+[m[32m        "ability": "Se você morrer, o Narrador ganha a habilidade de um Lacaio.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -1183,21 +1192,19 @@[m
         "name": "Po",[m
         "ability": "A cada noite*, você pode escolher um jogador: ele morre. Se a sua última escolha foi 'ninguém', escolha 3 jogadores esta noite.",[m
         "firstNightReminder": "",[m
[31m-        "otherNightReminder": "Se a última escolha feita pela Po foi 'ninguém': A Po aponta para 3 jogadores. Esses jogadores morrem. Caso contrário: A Po pode fazer 'não' com a cabeça, ou apontar para 1 jogador. Esse jogador morre.",[m
[32m+[m[32m        "otherNightReminder": "A Po pode escolher um jogador OU 3 jogadores se escolheu 'ninguém' na última noite. :reminder: ou :reminder: :reminder: reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "3 Ataques",[m
[31m-            "Morto 1",[m
[31m-            "Morto 2",[m
[31m-            "Morto 3"[m
[32m+[m[32m            "Morto"[m
         ][m
     },[m
     {[m
         "id": "poisoner",[m
         "name": "Envenenador",[m
         "ability": "A cada noite, escolha um jogador: ele fica envenenado até o anoitecer.",[m
[31m-        "firstNightReminder": "O Envenenador escolhe para um jogador. :reminder:",[m
[31m-        "otherNightReminder": "O Envenenador escolhe para um jogador. :reminder:",[m
[32m+[m[32m        "firstNightReminder": "O Envenenador escolhe um jogador. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "O Envenenador escolhe um jogador. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Envenenado"[m
[36m@@ -1226,9 +1233,9 @@[m
     {[m
         "id": "preacher",[m
         "name": "Pregador",[m
[31m-        "ability": "A cada noite, escolha um jogador: caso ele seja um Lacaio, saberá que foi escolhido. Todos os Lacaios escolhidos não têm habilidade.",[m
[31m-        "firstNightReminder": "O Pregador escolhe um jogador. Se esse jogador for um Lacaio: Acorde o alvo. Informe-o que foi escolhido pelo Pregador. O alvo não tem habilidade a partir de agora.",[m
[31m-        "otherNightReminder": "O Pregador escolhe um jogador. Se esse jogador for um Lacaio: Acorde o alvo. Informe-o que foi escolhido pelo Pregador. O alvo não tem habilidade a partir de agora.",[m
[32m+[m[32m        "ability": "A cada noite, escolha um jogador: um Lacaio, se escolhido, saberá disso. Todos os Lacaios escolhidos não têm habilidade.",[m
[32m+[m[32m        "firstNightReminder": "O Pregador escolhe um jogador :reminder:, coloque o Pregador para dormir. Se o jogador escolhido for um Lacaio acorde-o. Mostre-o os tokens *ESSE PERSONAGEM TE ESCOLHEU* e do Pregador.",[m
[32m+[m[32m        "otherNightReminder": "O Pregador escolhe um jogador :reminder:, coloque o Pregador para dormir. Se o jogador escolhido for um Lacaio acorde-o. Mostre-o os tokens *ESSE PERSONAGEM TE ESCOLHEU* e do Pregador.",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Sem habilidade"[m
[36m@@ -1258,9 +1265,9 @@[m
     {[m
         "id": "pukka",[m
         "name": "Pukka",[m
[31m-        "ability": "A cada noite, escolha um jogador: Ele está envenenado. O jogador envenenado anteriormente morre e então é desenvenenado.",[m
[31m-        "firstNightReminder": "A Pukka aponta para um jogador. Esse jogador fica envenenado.",[m
[31m-        "otherNightReminder": "A Pukka aponta para um jogador. Esse jogador fica envenenado. O jogador envenenado anteriormente morre e fica desenvenenado.",[m
[32m+[m[32m        "ability": "A cada noite, escolha um jogador: ele fica envenenado. O jogador envenenado anteriormente morre e então fica são.",[m
[32m+[m[32m        "firstNightReminder": "A Pukka escolhe um jogador. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "A Pukka escolhe um jogador. :reminder: :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Envenenado",[m
[36m@@ -1329,9 +1336,9 @@[m
     {[m
         "id": "sailor",[m
         "name": "Marinheiro",[m
[31m-        "ability": "A cada noite, escolha um jogador vivo: você ou ele está bêbado até o anoitecer. Você não pode morrer.",[m
[31m-        "firstNightReminder": "O Marinheiro aponta para um jogador. Marque ou Marinheiro, ou o jogador escolhido como 'Bêbado'.",[m
[31m-        "otherNightReminder": "Remova o token 'Bêbado'. O Marinheiro aponta para um jogador. Marque o Marinheiro ou o jogador escolhido como 'Bêbado'.",[m
[32m+[m[32m        "ability": "A cada noite, escolha um jogador vivo: um de vocês fica bêbado até o anoitecer. Você não pode morrer.",[m
[32m+[m[32m        "firstNightReminder": "O Marinheiro escolhe um jogador vivo. :reminder:",[m
[32m+[m[32m        "otherNightReminder": "O Marinheiro escolhe um jogador vivo. :reminder:",[m
         "remindersGlobal": [],[m
         "reminders": [[m
             "Bêbado"[m
[36m@@ -1358,7 +1365,7 @@[m
     {[m
         "id": "scapegoat",[m
         "name": "Bode Expiatório",[m
[31m-        "ability": "Se um jogador do mesmo alinhamento for executado, você pode ser executado em vez disso.",[m
[32m+[m[32m        "ability": "Se um jogador do seu alinhamento for executado, você pode ser executado em vez disso.",[m
         "firstNightReminder": "",[m
         "otherNightReminder": "",[m
         "remindersGlobal": [],[m
[36m@@ -1379,8 +1386,8 @@[m
         "id": "seamstress",[m
         "name": "Costureira",[m
         "ability": "Uma vez por jogo, à noite, você pode escolher 2 jogadores (exceto você): você descobre se eles têm o mesmo alinhamento.",[m
[31m-        "firstNightReminder": "A Costureira pode escolhe 2 jogadores. Sinalize 'sim' ou 'não' com a cabeça. (lembrete)",[m
[31m-        "otherNightReminder": "A Costureira pode escolhe 2 jogadores. Sinalize 'sim'