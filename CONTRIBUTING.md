# Contributing

Hi! I'm really excited that you are interested in contributing to this project. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#issue-reporting-guidelines)
- [Commit Message Guidelines](#issue-reporting-guidelines)
- [Development Setup](#development-setup)
- [Events](#events)

## Issue Reporting Guidelines

- Report a new issue through [GitHub](https://github.com/Skateside/pocket-grimoire/issues).
- The issue can be an improvement.
- Please include with your issue the browser and operating system you're using as well as steps necessary to reproduce the bug, if any.
- Be patient, I'm working on this project in my spare time 🙂

## Pull Request Guidelines

- The `main` branch is what is currently deployed to the website. All development should be done in dedicated branches.
- The name of the branch should:
    - Start with either `fix/` or `feature/` depending on whether it's a bug fix or a new feature.
    - Be named something easy to identify, e.g. `feature/player-name-tags`
    - Include the number of the git issue before the name, e.g. `fix/123-cache-clearing-issue` where 123 is the git issue id.
- Please don't make any changes to the following folders:
    - `bin` - This folder is needed to run command-line tasks which do things like populating the database.
    - `assets/data` - This folder contains the data that gets added to the database.
    - `config` - Symfony uses the files in this folder to set up the project correctly.
    - `node_modules` - This folder shouldn't be committed, although you're free to install any Node module that you feel are necessary. We can add modules to this by modifying the `package.json` file.
    - `public` - This folder contains files that are generated from other places, usually the `assets` folder.
    - `var` - Symfony uses this folder for logs and caches etc.
    - `vendor` - This is where backend modules are stored. We can get them through [Composer](https://getcomposer.org/) so we shouldn't modify this folder directly.
- **Never** commit an `.env` file.
- If you need to change the database, you will need to create a [migration](https://symfony.com/bundles/DoctrineMigrationsBundle/current/index.html)
- It's OK to have multiple small commits as you work on the Pull Request.
- If you're adding a new feature:
    - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first before working on it.
- If you're fixing a bug:
    - Add `(fix #xxxx)` (#xxxx is the issue id) in your Pull Request title.
    - Provide a detailed description of the bug in the Pull Request.
- A Pull Request should only relate to a single issue. Multiple issues require multiple pull requests.

## Commit Message Guidelines

- Please read the [7 Rules of a Great Commit Message](https://cbea.ms/git-commit/) by Chris Beams:
    1. Separate subject from body with a blank line.
    2. Limit the subject line to 50 characters.
    3. Capitalize the subject line.
    4. Do not end the subject line with a period.
    5. Use the imperative mood in the subject line.
    6. Wrap the body at 72 characters.
    7. Use the body to explain _what_ and _why_ vs. _how_.
- When working on an existing issue, add `See: #12345` at the bottom of the message, where 12345 is the ID of the issue. This helps keep track of any commits for the issue.

## Development Setup

This project is built using the [Symfony framework](https://symfony.com/doc/current/index.html) (version 5.4.7 at the moment because my server doesn't support PHP 8 yet) and assets are compiled using [Encore](https://symfony.com/doc/current/frontend/encore/simple-example.html). You may need to familiarise yourself with those frameworks before working on.

I use PHP 7.4 locally. My hosting currently doesn't support PHP 8 :pensive:

When I get the time, I'll put together an install file that populates the database so you won't need to ask me for a mysqldump. I've created a [git issue](https://github.com/Skateside/pocket-grimoire/issues/36) to remind myself so feel free to nudge me on that - maybe it'll help me create it faster?

## Events

The JavaScript code of the Pocket Grimoire is heavily event-based. [The events are documented here](events.md).
