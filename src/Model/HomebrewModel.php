<?php

namespace App\Model;

use Symfony\Contracts\Translation\TranslatorInterface;
use App\Repository\RoleRepository;
use App\Repository\TeamRepository;

class HomebrewModel
{

    protected $teamRepo;
    protected $roleRepo;
    protected $requiredKeys = [
        'id',
        'name',
        'ability',
        'team'
    ];
    protected $filteredKeys = [
        'id',
        'name',
        'ability',
        'image',
        'team',
        'firstNight',
        'firstNightReminder',
        'otherNight',
        'otherNightReminder',
        'reminders',
        'setup',
        'jinxes',
        'special'
    ];

    public function __construct(
        TeamRepository $teamRepo,
        RoleRepository $roleRepo,
        TranslatorInterface $translator
    ) {

        $this->teamRepo = $teamRepo;
        $this->roleRepo = $roleRepo;
        $this->translator = $translator;

    }

    /**
     * Checks to see if the given entry has the required keys.
     *
     * @param  array $entry
     * @param  array $keys
     * @return bool
     */
    protected function hasKeys(array $entry, array $keys): bool
    {

        foreach ($keys as $key) {
            if (!array_key_exists($key, $entry)) {
                return false;
            }
        }

        return true;

    }

    /**
     * Checks to see if the given entry is a homebrew entry.
     *
     * @param  array
     * @return bool
     */
    public function isHomebrewEntry(array $entry): bool
    {
        return $this->hasKeys($entry, $this->requiredKeys);
    }

    /**
     * Checks to see if the entry contains the meta information about the
     * script.
     *
     * @param  array $entry
     * @return bool
     */
    public function isMetaEntry(array $entry): bool
    {

        return (
            array_key_exists('id', $entry)
            && $entry['id'] === '_meta'
            && array_key_exists('name', $entry)
        );

    }

    /**
     * Checks to see if the entry just contains an 'id' key like an official
     * character.
     *
     * @param  array $entry
     * @return bool
     */
    public function isOfficialCharacter(array $entry): bool
    {

        if (!array_key_exists('id', $entry)) {
            return false;
        }

        $character = $this->roleRepo->findOneBy([
            'identifier' => $this->normaliseId($entry['id'])
        ]);

        return !is_null($character);

    }

    /**
     * Validates a single entry to make sure that it has all the required keys
     * and that it's part of a recognised team.
     *
     * @param  array $entry
     * @return bool
     */
    public function validateEntry(array $entry, array &$reason = []): bool
    {

        $isValid = true;
        $teams = [];

        if (!$this->isHomebrewEntry($entry)) {

            $reason[] = $this->translator->trans(
                'errors.homebrew_json.not_homebrew',
                ['%id%' => $entry['id']]
            );
            $isValid = false;

        }

        if (
            $isValid
            && !$this->teamRepo->findOneBy(['identifier' => $entry['team']])
        ) {

            $reason[] = $this->translator->trans(
                'errors.homebrew_json.unrecognised_team',
                ['%team%' => $entry['team']]
            );
            $isValid = false;

        }

        return $isValid;

    }

    /**
     * The official script tool creates IDs differently from our data. For
     * example: they have "lil_monsta" when we have "lilmonsta", they have
     * "al-hadikhia" when we have "alhadikhia" etc. This adjusts the given ID so
     * it will match our data.
     *
     * @param  string $id
     * @return string
     */
    public function normaliseId(string $id): string
    {
        return preg_replace('/[-_]/', '', $id);
    }

    /**
     * Validates all the entries and makes sure that all necessary teams have at
     * least 1 entry.
     *
     * @param  array $entries
     * @param  array $reasons
     * @return bool
     */
    public function validateAllEntries(array $entries, array &$reasons = []): bool
    {

        $isValid = true;
        $teams = array_map(function ($value) {
            return 0;
        }, array_flip($this->teamRepo->getTeamIds()));

        foreach ($entries as $entry) {

            // The entry might just be a string of the character's ID if it's a
            // reference to an official character.
            if (is_string($entry)) {
                $entry = ['id' => $entry];
            }

            if (!is_array($entry)) {

                $reasons[] = $this->translator->trans(
                    'errors.homebrew_json.not_find_id',
                    ['%id%' => var_export($entry, 1)]
                );
                $isValid = false;
                break;

            }

            if ($this->isMetaEntry($entry)) {
                continue;
            }

            if ($this->isOfficialCharacter($entry)) {

                $character = $this->roleRepo->findOneBy([
                    'identifier' => $this->normaliseId($entry['id'])
                ]);

                if (is_null($character)) {

                    $reasons[] = $this->translator->trans(
                        'errors.homebrew_json.not_recognise_character',
                        ['%id%' => $entry['id']]
                    );
                    $isValid = false;
                    break;

                }

                // The user may have uploaded a script that includes travellers
                // or fabled. This allows that team to be added optionally.
                $teamID = $character->getTeam()->getIdentifier();

                if (!array_key_exists($teamID, $teams)) {
                    $teams[$teamID] = 0;
                }

                $teams[$teamID] += 1;

                continue;

            }

            $invalidReasons = [];
            if (!$this->validateEntry($entry, $invalidReasons)) {

                $reasons[] = $this->translator->trans(
                    'errors.homebrew_json.invalid_entry',
                    [
                        '%id%' => $entry['id'],
                        '%reasons%' => implode(', ', $invalidReasons)
                    ]
                );
                $isValid = false;
                break;

            }

            if (array_key_exists($entry['team'], $teams)) {
                $teams[$entry['team']] += 1;
            }

        }

        if ($isValid && in_array(0, array_values($teams))) {

            $missingTeams = array_keys(array_filter($teams, function ($count) {
                return $count < 1;
            }));
            $reasons[] = $this->translator->trans(
                'errors.homebrew_json.empty_teams',
                ['%teams%' => implode(', ', $missingTeams)]
            );
            $isValid = false;

        }

        return $isValid;

    }

    /**
     * Filters an entry so it only includes the required keys.
     *
     * NOTE: `mixed` type was added in PHP 8.0 and unions were added in PHP 8.2.
     *
     * @param  array|string $entry
     * @return array
     */
    public function filterEntry($entry): array
    {

        // The entry might just be a string of the character's ID if it's a
        // reference to an official character.
        if (is_string($entry)) {
            $entry = ['id' => $entry];
        }

        if (!is_array($entry)) {
            return false;
        }

        if ($this->isMetaEntry($entry)) {

            return array_filter($entry, function ($key) {
                return in_array($key, ['id', 'name']);
            }, ARRAY_FILTER_USE_KEY);

        }

        if ($this->isOfficialCharacter($entry)) {
            return $entry;
        }

        return array_filter($entry, function ($key) {
            return in_array($key, $this->filteredKeys);
        }, ARRAY_FILTER_USE_KEY);

    }

    /**
     * Filters all entries so they all only include the required keys.
     *
     * @param  array $entries
     * @return array
     */
    public function filterAllEntries(array $entries): array
    {

        return array_map(function ($entry) {
            return $this->filterEntry($entry);
        }, $entries);

    }

}
