<?php

namespace App\Model;

class TPITranslationModel
{
    /**
     * Filters the raw jinxes so that only valid entries remain.
     *
     * @param array<mixed> $jinxes Jinxes to filter.
     * @return array<string, string> Filtered jinxes.
     */
    public function filterJinxes(array $jinxes): array
    {
        $filtered = [];

        foreach ($jinxes as $key => $value) {
            if (
                preg_match('/^[a-z]+\-[a-z]+$/', $key) === 1
                && is_string($value)
            ) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }

    /**
     * Filters the raw reminders so that only valid entries remain.
     *
     * @param array<mixed> $reminders Reminders to filter.
     * @return array<string, array{text: string, examples: string[]}> Filtered reminders.
     */
    public function filterReminders(array $reminders): array
    {
        /*
        return array_filter($reminders, function ($item) {
            return is_string($item);
        });
         */
        return array_filter($reminders, function ($item) {
            return (
                is_array($item)
                && array_key_exists('text', $item)
                && is_string($item['text'])
                && array_key_exists('examples', $item)
                && is_array($item['examples'])
            );
        });
    }

    /**
     * Filters the raw roles so that only valid entries remain.
     *
     * @param array $roles Roles to filter.
     * @return array Filtered roles.
     */
    /*
    public function filterRoles(array $roles): array
    {
        $filtered = [];

        foreach ($roles as $id => $translations) {
            if (!is_array($translations)) {
                continue;
            }

            if (!$this->arrayAll($translations, function ($value) {
                return is_string($value);
            })) {
                continue;
            }

            $filtered[$id] = $translations;
        }

        return $filtered;
    }
     */

    /**
     * Combines the roles with the translations.
     *
     * @param array $baseRoles The base (English) roles.
     * @param array $baseReminders The base (English) reminders.
     * @param array $translatedRoles The translated roles.
     * @param array $translatedReminders The translated reminders.
     * @return array The combined, translated roles.
     */
    public function combineRoles(
        array $baseRoles,
        array $baseReminders,
        array $translatedRoles,
        array $translatedReminders
    ): array {
        $combined = [];

        foreach ($baseRoles as $baseRole) {
            $role = $baseRole;
            $translatedRole = $translatedRoles[$baseRole['id']] ?? [];

            if (array_key_exists('ability', $translatedRole)) {
                $role['ability'] = $translatedRole['ability'];
            }

            if (array_key_exists('flavor', $translatedRole)) {
                $role['flavor'] = $translatedRole['flavor'];
            }

            if (array_key_exists('name', $translatedRole)) {
                $role['name'] = $translatedRole['name'];
            }

            if (array_key_exists('first', $translatedRole)) {
                $role['firstNightReminder'] = TPIResourcesModel::cleanNightReminder($translatedRole['first']);
            }

            if (array_key_exists('other', $translatedRole)) {
                $role['otherNightReminder'] = TPIResourcesModel::cleanNightReminder($translatedRole['other']);
            }

            if (array_key_exists('reminders', $role)) {
                $role['reminders'] = array_map(function ($item) use ($baseReminders, $translatedReminders) {
                    return $translatedReminders[$item] ?? $baseReminders[$item]['text'] ?? $item;
                }, $role['reminders']);
            }

            if (array_key_exists('remindersGlobal', $role)) {
                $role['remindersGlobal'] = array_map(function ($item) use ($baseReminders, $translatedReminders) {
                    return $translatedReminders[$item] ?? $baseReminders[$item]['text'] ?? $item;
                }, $role['remindersGlobal']);
            }

            $combined[] = $role;
        }

        return $combined;
    }

    /**
     * Combines the jinxes.
     *
     * @param array $baseJinxes Base (English) jinxes.
     * @param array $translatedJinxes Translated jinxes.
     * @return array Combined, translated jinxes.
     */
    public function combineJinxes(
        array $baseJinxes,
        array $translatedJinxes
    ): array {
        $combined = [];

        foreach ($baseJinxes as $baseJinx) {
            $jinx = [
                'id' => $baseJinx['id'],
                'jinx' => [],
            ];

            foreach ($baseJinx['jinx'] as $innerJinx) {
                $jinx['jinx'][] = [
                    'id' => $innerJinx['id'],
                    'reason' => $translatedJinxes["{$baseJinx['id']}-{$innerJinx['id']}"] ?? $translatedJinxes["{$innerJinx['id']}-{$baseJinx['id']}"] ?? $innerJinx['reason'],
                ];
            }

            $combined[] = $jinx;
        }

        return $combined;
    }

    /**
     * Equivalent of array_all() for PHP < 8.4.
     *
     * @param array<mixed> $array Array to check.
     * @param callable(mixed, int|string): bool $callback Callback for checking.
     * @return bool true if all values and keys match the callback, false otherwise.
     */
    protected function arrayAll(array $array, callable $callback): bool
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key) !== true) {
                return false;
            }
        }

        return true;
    }
}
