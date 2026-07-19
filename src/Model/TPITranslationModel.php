<?php

namespace App\Model;

class TPITranslationModel
{
    /**
     * Converts the Pocket Grimoire locale code into the locale code that TPI
     * uses.
     *
     * @param string $locale Pocket Grimoire locale code.
     * @return string TPI locale code.
     */
    public function asTPILocale(string $locale): string
    {
        $map = [
            'es_AR' => 'es_419',
            'nb_NO' => 'nb_NO',
            'nn_NO' => 'nb_NO',
            'pt_BR' => 'pt_BR',
            'zh_CN' => 'zh_Hans',
        ];

        if (array_key_exists($locale, $map)) {
            return $map[$locale];
        }

        return substr($locale, 0, 2);
    }

    /**
     * Filters the raw jinxes so that only valid entries remain.
     *
     * @param array $jinxes Jinxes to filter.
     * @return array Filtered jinxes.
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
     * @param array $reminders Reminders to filter.
     * @return array Filtered reminders.
     */
    public function filterReminders(array $reminders): array
    {
        return array_filter($reminders, function ($item) {
            return is_string($item);
        });
    }

    /**
     * Filters the raw roles so that only valid entries remain.
     *
     * @param array $roles Roles to filter.
     * @return array Filtered roles.
     */
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
        array $translatedReminders,
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
                $role['firstNightReminder'] = $translatedRole['first'];
            }

            if (array_key_exists('other', $translatedRole)) {
                $role['otherNightReminder'] = $translatedRole['other'];
            }

            if (array_key_exists('reminders', $role)) {
                $role['reminders'] = array_map(function ($item) use ($baseReminders, $translatedReminders) {
                    return $translatedReminders[$item] ?? $baseReminders[$item] ?? $item;
                }, $role['reminders']);
            }

            if (array_key_exists('remindersGlobal', $role)) {
                $role['remindersGlobal'] = array_map(function ($item) use ($baseReminders, $translatedReminders) {
                    return $translatedReminders[$item] ?? $baseReminders[$item] ?? $item;
                }, $role['remindersGlobal']);
            }

            $combined[] = $role;
        }

        return $combined;
    }

    public function combineJinxes(
        array $baseJinxes,
        array $translatedJinxes,
    ): array {
        return [];
    }

    /**
     * Equivalent of array_all() for PHP < 8.
     *
     * @param array $array Array to check.
     * @param callable $callback Callback for checking.
     * @return true if all values and keys match the callback, false otherwise.
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
