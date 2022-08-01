<?php

namespace App\Model;

use App\Repository\TeamRepository;

class HomebrewModel
{

    protected $teamRepo;
    protected $requiredKeys = [
        'name',
        'ability',
        'image',
        'team'
    ];

    public function __construct(
        TeamRepository $teamRepo
    ) {
        $this->teamRepo = $teamRepo;
    }

    /**
     * Validates a single entry to make sure that it has all the required keys
     * and that it's part of a recognised team.
     *
     * @param  array $entry
     * @return bool
     */
    public function validateEntry(array $entry): bool
    {

        $isValid = true;
        $teams = [];

        foreach ($this->requiredKeys as $key) {

            if (!array_key_exists($key, $entry)) {

                $isValid = false;
                break;

            }

        }

        if (
            $isValid
            && !$this->teamRepo->findOneBy(['identifier' => $entry['key']])
        ) {
            $isValid = false;
        }

        return $isValid;

    }

    /**
     * Validates all the entries and makes sure that all necessary teams have at
     * least 1 entry.
     *
     * @param  array $entries
     * @return bool
     */
    public function validateAllEntries(array $entries): bool
    {

        $isValid = true;
        $teams = array_map(function ($value) {
            return 0;
        }, array_flip($this->teamRepo->getTeamIds()));

        foreach ($entries as $entry) {

            if (!$this->validateEntry($entry)) {

                $isValid = false;
                break;

            }

            if (array_key_exists($entry['team'], $teams)) {
                $teams[$entry['team']] += 1;
            }

        }

        if ($isValid && in_array($teams, 0)) {
            $isValid = false;
        }

        return $isValid;

    }

    /**
     * Filters an entry so it only includes the required keys.
     *
     * @param  array $entry
     * @return array
     */
    public function filterEntry(array $entry): array
    {

        return array_filter($entry, function ($key) {
            return in_array($key, $this->requiredKeys);
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
