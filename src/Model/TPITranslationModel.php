<?php

namespace App\Model;

use App\Dto\{
    CommunityJinxesDto,
    CommunityRolesDto,
    JinxesDto,
    TPIRemindersDto,
    TPIRemindersExpandedDto,
    TPIRolesExpandedDto,
    TranslationJinxesDto,
    TranslationRolesDto,
};
use App\Service\Misc;

/**
 * @phpstan-import-type Data from TPIRemindersDto as RemindersArray
 * @phpstan-import-type Data from JinxesDto as JinxesArray
 * @phpstan-import-type Data from TPIRolesExpandedDto as RolesArray
 */
class TPITranslationModel
{
    public function __construct(
        protected Misc $misc,
    ) {}

    /**
     * Translates the reminders.
     *
     * @param TPIRemindersExpandedDto $reminders Expanded reminders to
     * translate.
     * @param TPIRemindersDto $officialReminders Official translations of the
     * reminders.
     * @param CommunityRolesDto $communityRoles Community translations of the
     * roles.
     * @return RemindersArray
     */
    public function translateReminders(
        TPIRemindersExpandedDto $reminders,
        TPIRemindersDto $officialReminders,
        CommunityRolesDto $communityRoles,
    ): array {
        $translatedReminders = [];

        foreach ($reminders->items as $reminder) {
            // Assume the default translation, see if we can better it.
            $translatedReminders[$reminder->key] = $reminder->text;

            // If we can find the official translation, use it.
            $officialReminder = $this->misc->arrayFind(
                $officialReminders->items,
                function ($officialReminder) use ($reminder) {
                    return $officialReminder->key === $reminder->key;
                },
            );

            if ($officialReminder !== null) {
                $translatedReminders[$reminder->key] = $officialReminder->text;
                continue;
            }

            // If we couldn't find an official translation, loop through the
            // examples until we find something that matches and use it.
            foreach ($reminder->examples as $example) {
                list($roleId, $type, $index) = explode('.', $example); 

                $role = $this->misc->arrayFind(
                    $communityRoles->items,
                    function ($role) use ($roleId) {
                        return $role->id === $roleId;
                    },
                );

                if ($role === null) {
                    continue;
                }

                if (
                    $type === 'r'
                    && is_array($role->reminders)
                    && array_key_exists($index, $role->reminders)
                ) {
                    $translatedReminders[$reminder->key] = $role->reminders[$index];
                    break 1;
                } else if (
                    $type === 'g'
                    && is_array($role->remindersGlobal)
                    && array_key_exists($index, $role->remindersGlobal)
                ) {
                    $translatedReminders[$reminder->key] = $role->remindersGlobal[$index];
                    break 1;
                }
            }
        }

        return $translatedReminders;
    }

    /**
     * Translates the jinxes.
     *
     * @param JinxesDto $jinxes Raw jinx information.
     * @param TranslationJinxesDto $officialJinxes Official jinx translations.
     * @param CommunityJinxesDto $communityJinxes Community jinx translations.
     * @return JinxesArray Translated jinxes.
     */
    public function translateJinxes(
        JinxesDto $jinxes,
        TranslationJinxesDto $officialJinxes,    
        CommunityJinxesDto $communityJinxes,
    ): array {
        $translatedJinxes = [];

        foreach ($jinxes->items as $jinx) {
            $translatedJinx = [
                'id' => $jinx->id,
                'jinx' => [],
            ];

            foreach ($jinx->jinx as $jinxEntry) {
                $translatedJinxEntry = [
                    'id' => $jinxEntry->id,
                    'reason' => $jinxEntry->reason,
                ];

                $community = null; // Created later if $official is null.
                $official = $this->misc->arrayFind(
                    $officialJinxes->items,
                    function ($item) use ($jinx, $jinxEntry) {
                        return $item->key === "{$jinx->id}-{$jinxEntry->id}";
                    },
                );

                if ($official === null) {
                    $official = $this->misc->arrayFind(
                        $officialJinxes->items,
                        function ($item) use ($jinx, $jinxEntry) {
                            return $item->key === "{$jinxEntry->id}-{$jinx->id}";
                        },
                    );
                }

                if ($official === null) {
                    $community = $this->misc->arrayFind(
                        $communityJinxes->items,
                        function ($item) use ($jinx, $jinxEntry) {
                            return (
                                (
                                    $item->target === $jinx->id
                                    && $item->trick === $jinxEntry->id
                                )
                                || (
                                    $item->target === $jinxEntry->id
                                    && $item->trick === $jinx->id
                                )
                            );
                        },
                    );
                }

                if ($official !== null) {
                    $translatedJinxEntry['reason'] = $official->reason;
                } elseif ($community !== null) {
                    $translatedJinxEntry['reason'] = $community->reason;
                }

                $translatedJinx['jinx'][] = $translatedJinxEntry;
            }

            $translatedJinxes[] = $translatedJinx;
        }

        return $translatedJinxes;
    }

    /**
     * Translates the character roles.
     *
     * @param TPIRolesExpandedDto $roles
     * @param TranslationRolesDto $officialRoles
     * @param CommunityRolesDto $communityRoles
     * @param RemindersArray $reminders
     * @return RolesArray
     */
    public function translateRoles(
        TPIRolesExpandedDto $roles,
        TranslationRolesDto $officialRoles,
        CommunityRolesDto $communityRoles,
        array $reminders,
    ): array {
        $translatedRoles = [];
        $keys = [
            [
                'role' => 'name',
                'official' => 'name',
                'community' => 'name',
            ],
            [
                'role' => 'ability',
                'official' => '',
                'community' => 'ability',
            ],
            [
                'role' => 'flavor',
                'official' => 'flavor',
                'community' => 'flavor',
            ],
            [
                'role' => 'firstNightReminder',
                'official' => 'first',
                'community' => 'firstNightReminder',
            ],
            [
                'role' => 'otherNightReminder',
                'official' => 'other',
                'community' => 'otherNightReminder',
            ],
        ];

        foreach ($roles->items as $role) {
            $localKeys = array_filter($keys, function ($key) use ($role) {
                return property_exists($role, $key['role']);
            });
            $translatedRole = $role->toArray();

            if (is_array($role->reminders)) {
                $translatedRole['reminders'] = array_map(
                    function ($text) use ($reminders) {
                        return array_key_exists($text, $reminders) ? $reminders[$text] : $text;
                    },
                    $role->reminders,
                );
            }

            if (is_array($role->remindersGlobal)) {
                $translatedRole['remindersGlobal'] = array_map(
                    function ($text) use ($reminders) {
                        return array_key_exists($text, $reminders) ? $reminders[$text] : $text;
                    },
                    $role->remindersGlobal,
                );
            }

            if (!count($localKeys)) {
                $translatedRoles[] = $translatedRole;
                continue;
            }

            $officialRole = $this->misc->arrayFind(
                $officialRoles->items,
                function ($item) use ($role) {
                    return $item->id === $role->id;
                },
            );

            if ($officialRole !== null) {
                $index = count($localKeys);

                while ($index > 0) {
                    $index -= 1;
                    $key = $localKeys[$index]['official'];

                    if (
                        property_exists($officialRole, $key)
                        && $officialRole->{$key} !== null
                    ) {
                        $translatedRole[$localKeys[$index]['role']] = $officialRole->{$key};
                        array_splice($localKeys, $index, 1);
                        continue;
                    }
                }
            }

            if (!count($localKeys)) {
                $translatedRoles[] = $translatedRole;
                continue;
            }

            $communityRole = $this->misc->arrayFind(
                $communityRoles->items,
                function ($item) use ($role) {
                    return $item->id === $role->id;
                },
            );

            if ($communityRole !== null) {
                $index = count($localKeys);

                while ($index > 0) {
                    $index -= 1;
                    $key = $localKeys[$index]['community'];

                    if (
                        property_exists($communityRole, $key)
                        && $communityRole->{$key} !== null
                    ) {
                        $translatedRole[$localKeys[$index]['role']] = $communityRole->{$key};
                        array_splice($localKeys, $index, 1);
                        continue;
                    }
                }
            }

            $translatedRoles[] = $translatedRole;
        }

        return $translatedRoles;
    }

    /**
     * Filters the raw jinxes so that only valid entries remain.
     *
     * @param array<mixed> $jinxes Jinxes to filter.
     * @return array<string, string> Filtered jinxes.
     */
    /*
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
     */

    /**
     * Filters the raw reminders so that only valid entries remain.
     *
     * @param array<mixed> $reminders Reminders to filter.
     * @return array<string, array{text: string, examples: string[]}> Filtered reminders.
     */
    /*
    public function filterReminders(array $reminders): array
    {
        /*
        return array_filter($reminders, function ($item) {
            return is_string($item);
        });
         * /
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
     */

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
    /*
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
     */

    /**
     * Combines the jinxes.
     *
     * @param array $baseJinxes Base (English) jinxes.
     * @param array $translatedJinxes Translated jinxes.
     * @return array Combined, translated jinxes.
     */
    /*
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
     */

    /**
     * Equivalent of array_all() for PHP < 8.4.
     *
     * @template T
     * @param array<T> $array Array to check.
     * @param callable(T, int|string): bool $callback Callback for checking.
     * @return bool true if all values and keys match the callback, false otherwise.
     */
    /*
    protected function arrayAll(array $array, callable $callback): bool
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key) !== true) {
                return false;
            }
        }

        return true;
    }
     */
}
