<?php

namespace App\Model;

class TPIResourcesModel
{
    /**
     * @var string Location wrapper for the images.
     */
    const LOCATION_IMAGES = '/build/img/roles/%s.webp';

    /**
     * An error message generated when validating a role.
     */
    private string $message = '';

    /**
     * Gets the latest role validation error message.
     *
     * @return string Latest role validation error message.
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Filter the roles so that only valid roles are included.
     *
     * @param array $roles Roles to filter.
     * @return array Filtered roles.
     */
    public function filterRoles(array $roles): array
    {
        $filtered = array_filter($roles, [$this, 'isValidRoleEntry']);

        foreach ($filtered as $role) {

            if (is_array($role['reminders'] ?? null)) {
                $role['reminders'] = array_filter($role['reminders'], function ($item) {
                    return is_string($item);
                });

                if (!count($role['reminders'])) {
                    unset($role['reminders']);
                }
            }

            if (is_array($role['remindersGlobal'] ?? null)) {
                $role['remindersGlobal'] = array_filter($role['remindersGlobal'], function ($item) {
                    return is_string($item);
                });

                if (!count($role['remindersGlobal'])) {
                    unset($role['remindersGlobal']);
                }
            }

            if (is_array($role['special'] ?? null)) {
                $role['special'] = array_filter($role['special'], function ($item) {
                    return $this->isValidSpecialEntry($item);
                });

                if (!count($role['special'])) {
                    unset($role['special']);
                }
            }

        }

        return $filtered;
    }

    /**
     * Filter the jinxes so that only valid jinxes are included.
     *
     * @param array $jinxes Jinxes to filter.
     * @return array Filtered jinxes.
     */
    public function filterJinxes(array $jinxes): array
    {
        $filtered = array_filter($jinxes, [$this, 'isValidJinxEntry']);

        foreach ($filtered as $index => $jinx) {
            $jinx['jinx'] = array_filter($jinx['jinx'], function ($item) {
                return $this->isValidJinxJinxEntry($item);
            });

            if (!count($jinx['jinx'])) {
                array_splice($filtered, $index, 1);
            }
        }

        return $filtered;
    }

    /**
     * Filter the night sheet so that only valid entries are included.
     *
     * @param array $nightsheet Night sheet to filter.
     * @return array Filtered sheet.
     */
    public function filterNightsheet(array $nightsheet): array
    {
        $filtered = array_filter($nightsheet, function ($item) {
            return is_array($item);
        });

        foreach ($filtered as $key => $night) {
            $filtered[$key] = array_filter($night, function ($id) {
                return is_string($id);
            });
        }

        return $filtered;
    }

    /**
     * Combines the data.
     *
     * @param array $roles Raw roles to modify.
     * @param array $nightsheet Night sheet for the first and other nightrs.
     * @return array Combined data.
     */
    public function combineRoles(
        array $roles,
        array $nightsheet,
    ): array {
        $combined = [];

        $firstNight = $nightsheet['firstNight'];
        $otherNight = $nightsheet['otherNight'];

        foreach ($roles as $role) {
            $cleanRole = [
                'id' => $role['id'],
                'name' => $role['name'],
                'team' => $role['team'],
                'edition' => $role['edition'],
                'setup' => $role['setup'],
                'ability' => $role['ability'],
                'flavor' => $role['flavor'],
            ];
            
            if (array_key_exists('reminders', $role)) {
                $cleanRole['reminders'] = $role['reminders'];
            }

            if (array_key_exists('remindersGlobal', $role)) {
                $cleanRole['remindersGlobal'] = $role['remindersGlobal'];
            }

            if (
                array_key_exists('firstNightReminder', $role)
                && in_array($role['id'], $nightsheet['firstNight'])
            ) {
                $cleanRole['firstNight'] = array_search($role['id'], $nightsheet['firstNight']) + 1;
                $cleanRole['firstNightReminder'] = $this->cleanNightReminder($role['firstNightReminder']);
            }

            if (
                array_key_exists('otherNightReminder', $role)
                && in_array($role['id'], $nightsheet['otherNight'])
            ) {
                $cleanRole['otherNight'] = array_search($role['id'], $nightsheet['otherNight']) + 1;
                $cleanRole['otherNightReminder'] = $this->cleanNightReminder($role['otherNightReminder']);
            }

            $cleanRole['image'] = $this->generateImages($role['id'], $role['team']);

            $combined[] = $cleanRole;
        }

        usort($combined, function ($a, $b) {
            return $a['id'] <=> $b['id'];
        });

        return $combined;
    }

    /**
     * Cleans the given text to remove any instance of ":reminder:" (and any
     * extra spaces generated by that removal).
     *
     * @param string $nightReminder Night reminder to clean.
     * @return string Cleaned night reminder.
     */
    public function cleanNightReminder(string $nightReminder)
    {
        $removed = str_replace(':reminder:', '', $nightReminder);
        $unspaced = preg_replace('/\s+/', ' ', $removed);
        
        // Fix the Po.
        $unorred = preg_replace('/\.\s+[a-z]\s+$/i', '', $unspaced);
        $despaced = preg_replace('/\s+/', ' ', $unorred);

        return (string) $despaced;
    }

    /**
     * Checks to see if the given item is a valid role.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid role, `false` otherwise.
     */
    public function isValidRoleEntry(mixed $item): bool
    {
        $this->message = '';

        // Check that we can even debug this entry.
        if (!is_array($item) || !is_string($item['id'] ?? null)) {
            $this->message = 'Not an array or missing ID';
            return false;
        }

        // Check the basic structure and make sure that all required keys exist
        // in a format that we're expecting.
        // ("required" based on the keys that appear in all entries in roles.json)
        if (
            !is_string($item['name'] ?? null)
            || !is_string($item['team'] ?? null)
            || !is_string($item['edition'] ?? null)
            || !is_bool($item['setup'] ?? null)
            || !is_string($item['ability'] ?? null)
            || !is_string($item['flavor'] ?? null)
        ) {
            $this->message = "'{$item['id']}' missing required key";
            return false;
        }

        // If a first night reminder exists, make sure it's a string.
        if (
            array_key_exists('firstNightReminder', $item)
            && !is_string($item['firstNightReminder'])
        ) {
            $this->message = "'{$item['id']}' invalid first night reminder";
            return false;
        }

        // If an other night reminder exists, make sure it's a string.
        if (
            array_key_exists('otherNightReminder', $item)
            && !is_string($item['otherNightReminder'])
        ) {
            $this->message = "'{$item['id']}' invalid other night reminder";
            return false;
        }

        return true;
    }

    /**
     * Checks to see if the given item is a valid role special entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid role special entry, `false`
     * otherwise.
     */
    protected function isValidSpecialEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['type'] ?? null)
            && is_string($item['name'] ?? null)
            && (!array_key_exists('time', $item) || is_string($item['time']))
            && (!array_key_exists('global', $item) || is_string($item['global']))
            && (
                !array_key_exists('value', $item)
                || is_string($item['value'])
                || is_int($item['value'])
            )
        );
    }

    /**
     * Checks to see if the given item is a valid jinx entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid jinx entry, `false` otherwise.
     */
    protected function isValidJinxEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['id'] ?? null)
            && is_array($item['jinx'] ?? null)
        );
    }

    /**
     * Checks to see if the given item is a valid "jinx" item in a jinx entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid "jinx" item in a jinx entry,
     * `false` otherwise.
     */
    protected function isValidJinxJinxEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['id'] ?? null)
            && is_string($item['reason'] ?? null)
        );
    }

    /**
     * Generates the images for the given role.
     *
     * @param string $id Role ID.
     * @param string $team Role's team.
     * @return array Array of image locations.
     */
    protected function generateImages(string $id, string $team): array
    {
        $images = [];

        switch ($team) {
        case 'fabled':
        case 'loric':
            $images = [$id];
            break;

        case 'townsfolk':
        case 'outsider':
            $images = ["{$id}_g", "{$id}_e"];
            break;

        case 'minion':
        case 'demon':
            $images = ["{$id}_e", "{$id}_g"];
            break;

        case 'traveller':
            $images = [$id, "{$id}_g", "{$id}_e"];
            break;
        }

        return array_map(function ($image) {
            return sprintf(static::LOCATION_IMAGES, $image);
        }, $images);
    }
}
