<?php

namespace App\Model;

use Symfony\Component\Serializer\Normalizer\{
    DenormalizerInterface,
    NormalizerInterface,
};
use App\Dto\{
    CommunityJinxDto,
    CommunityRoleDto,
    GameDto,
    JinxDto,
    ScriptDto,
    TPIReminderDto,
    TPIReminderExpandedDto,
    TPIRoleExpandedDto,
    TranslationJinxDto,
    TranslationRoleDto,
};
use App\Service\Misc;

/**
 * @phpstan-import-type Data from JinxDto as JinxArray
 * @phpstan-import-type Data from TPIRoleExpandedDto as RoleArray
 * @phpstan-import-type Data from GameDto as GameArray
 * @phpstan-import-type MetaEntry from ScriptDto as ScriptMetaEntry
 */
class TPITranslationModel
{
    public function __construct(
        protected Misc $misc,
        protected DenormalizerInterface&NormalizerInterface $normalizer,
    ) {}

    /**
     * Translates the reminders.
     *
     * @param array<TPIReminderExpandedDto> $reminders Expanded reminders to
     * translate.
     * @param ?array<TPIReminderDto> $officialReminders Official translations
     * of the reminders.
     * @param array<CommunityRoleDto> $communityRoles Community translations of
     * the roles.
     * @return array<string, string>
     */
    public function translateReminders(
        array $reminders,
        ?array $officialReminders,
        array $communityRoles,
    ): array {
        $translatedReminders = [];

        foreach ($reminders as $reminder) {
            // Assume the default translation, see if we can better it.
            $translatedReminders[$reminder->key] = $reminder->text;

            // If we can find the official translation, use it.
            if ($officialReminders !== null) {
                $officialReminder = $this->misc->arrayFind(
                    $officialReminders,
                    function ($officialReminder) use ($reminder) {
                        return $officialReminder->key === $reminder->key;
                    },
                );

                if ($officialReminder !== null) {
                    $translatedReminders[$reminder->key] = $officialReminder->text;
                    continue;
                }
            }

            // If we couldn't find an official translation, loop through the
            // examples until we find something that matches and use it.
            foreach ($reminder->examples as $example) {
                list($roleId, $type, $index) = explode('.', $example); 

                $role = $this->misc->arrayFind(
                    $communityRoles,
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
     * @param array<JinxDto> $jinxes Raw jinx information.
     * @param ?array<TranslationJinxDto> $officialJinxes Official jinx translations.
     * @param array<CommunityJinxDto> $communityJinxes Community jinx translations.
     * @return array<JinxArray> Translated jinxes.
     */
    public function translateJinxes(
        array $jinxes,
        ?array $officialJinxes,    
        array $communityJinxes,
    ): array {
        $translatedJinxes = [];

        foreach ($jinxes as $jinx) {
            $translatedJinx = [
                'id' => $jinx->id,
                'jinx' => [],
            ];

            foreach ($jinx->jinx as $jinxEntry) {
                $translatedJinxEntry = [
                    'id' => $jinxEntry->id,
                    'reason' => $jinxEntry->reason,
                ];

                $official = null;
                $community = null;

                if ($officialJinxes !== null) {
                    $official = $this->misc->arrayFind(
                        $officialJinxes,
                        function ($item) use ($jinx, $jinxEntry) {
                            return $item->key === "{$jinx->id}-{$jinxEntry->id}";
                        },
                    );

                    if ($official === null) {
                        $official = $this->misc->arrayFind(
                            $officialJinxes,
                            function ($item) use ($jinx, $jinxEntry) {
                                return $item->key === "{$jinxEntry->id}-{$jinx->id}";
                            },
                        );
                    }
                }

                if ($official === null) {
                    $community = $this->misc->arrayFind(
                        $communityJinxes,
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
     * @param array<TPIRoleExpandedDto> $roles
     * @param ?array<TranslationRoleDto> $officialRoles
     * @param array<CommunityRoleDto> $communityRoles
     * @param array<string, string> $reminders
     * @return array<RoleArray>
     */
    public function translateRoles(
        array $roles,
        ?array $officialRoles,
        array $communityRoles,
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

        foreach ($roles as $role) {
            $localKeys = array_filter($keys, function ($key) use ($role) {
                return property_exists($role, $key['role']);
            });
            $translatedRole = $this->normalizer->normalize($role, 'json');

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

            $officialRole = null;

            if ($officialRoles !== null) {
                $officialRole = $this->misc->arrayFind(
                    $officialRoles,
                    function ($item) use ($role) {
                        return $item->id === $role->id;
                    },
                );
            }

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
                $communityRoles,
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

            $translatedRoles[] = array_filter(
                $translatedRole,
                fn($item) => !is_null($item),
            );
        }

        return $translatedRoles;
    }

    /**
     * Normalizes the games, converting them into an array.
     *
     * @param array<GameDto> $games Games to normalize.
     * @return array<GameArray> Normalized games.
     */
    public function normalizeGames(array $games): array
    {
        return array_map(
            fn($game) => $this->normalizer->normalize($game),
            $games,
        );
    }

    /**
     * Normalizes the scripts, converting them into an array.
     *
     * @param array<ScriptDto> $scripts Scripts to normalize.
     * @return array<string, array<string|ScriptMetaEntry>> Normalized scripts.
     */
    public function normalizeScripts(array $scripts): array
    {
        $normal = [];

        foreach ($scripts as $script) {
            $normalizedScript = $this->normalizer->normalize($script);
            $normalScript = [];

            if ($script->meta !== null) {
                $normalScript[] = array_filter(
                    $normalizedScript['meta'],
                    fn($item) => !is_null($item),
                );
            }

            foreach ($script->roles as $role) {
                $normalScript[] = $role;
            }

            $normal[$script->key] = $normalScript;
        }

        return $normal;
    }
}
