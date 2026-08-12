<?php

namespace App\Model;

use Symfony\Contracts\Translation\TranslatorInterface;
use App\Repository\RoleRepository;

class HomebrewModel
{

    protected $roleRepo;
    protected $translator;
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
        RoleRepository $roleRepo,
        TranslatorInterface $translator
    ) {

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
     * @param  array $entry
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
     * Checks to see if the entry looks like an official character - i.e. it's
     * either a string containing the ID, or an array that has a single entry:
     * the ID.
     *
     * @param mixed $entry Entry to check.
     * @return bool true if the entry looks like an official character, false
     *         otherwise.
     */
    public function looksOfficial($entry): bool
    {
        if (is_string($entry)) {
            return true;
        }

        if (!is_array($entry)) {
            return false;
        }

        if (count(array_keys($entry)) === 1 && array_key_exists('id', $entry)) {
            return true;
        }

        return false;
    }

    /**
     * Validates a single entry to make sure that it has all the required keys
     * and that it's part of a recognised team.
     *
     * @param  array $entry
     * @param  array $reason
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

        try {
            $role = $this->roleRepo->createTemp($entry);
        } catch (\TypeError $error) {

            $message = $error->getMessage();
            $matches = [];
            $test = preg_match(
                '/::(\w+)\(\)[\s\w]+type (\w+),\s(\w+) given/',
                $message,
                $matches,
            );

            if ($test === 1) {

                $reason[] = $this->translator->trans(
                    'errors.homebrew_json.invalid_property',
                    [
                        '%property%' => lcfirst(substr($matches[1], 3)),
                        '%expected%' => $matches[2],
                        '%given%' => $matches[3],
                    ]
                );

            } else {
                $reason[] = $message;
            }

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

            if ($this->isMetaEntry($entry) || $this->looksOfficial($entry)) {
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

        if ($this->looksOfficial($entry)) {
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
