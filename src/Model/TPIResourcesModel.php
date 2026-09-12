<?php

namespace App\Model;

/**
 * @phpstan-import-type Data from \App\Dto\NightsheetDto as Nightsheet
 * @phpstan-import-type Data from \App\Dto\TPIRemindersDto as TPIReminders
 * @phpstan-import-type Data from \App\Dto\TPIRemindersExpandedDto as TPIRemindersExpanded
 * @phpstan-import-type Data from \App\Dto\TPIRolesDto as TPIRoles
 * @phpstan-import-type Data from \App\Dto\TPIRolesExpandedDto as TPIRolesExpanded
 */
class TPIResourcesModel
{
    /**
     * @var string Location wrapper for the images.
     */
    const LOCATION_IMAGES = '/build/img/roles/%s.webp';

    /**
     * Expands the reminders to include examples of the reminder text, allowing
     * us to get that information from the community translations.
     *
     * @param TPIReminders $reminders Reminders to expand.
     * @param TPIRoles $roles Roles that have the reminder texts in them.
     * @return TPIRemindersExpanded Expanded reminders.
     */
    public function expandReminders(array $reminders, array $roles): array
    {
        $expanded = [];

        foreach ($reminders as $key => $text) {
            $entry = [
                'text' => $text,
                'examples' => [],
            ];

            foreach ($roles as $role) {
                if (($index = array_search($text, $role['reminders'] ?? [])) !== false) {
                    $entry['examples'][] = "{$role['id']}.r.{$index}";
                }
                if (($index = array_search($text, $role['remindersGlobal'] ?? [])) !== false) {
                    $entry['examples'][] = "{$role['id']}.g.{$index}";
                }
            }

            $expanded[$key] = $entry;
        }

        return $expanded;
    }

    /**
     * Expand the roles data into something that can be used.
     *
     * @param TPIRoles $roles Roles to expand.
     * @param Nightsheet $nightsheet Nightsheet for the roles.
     * @param TPIReminders $reminders Reversed reminders.
     * @return TPIRolesExpanded Expanded roles.
     */
    public function expandRoles(
        array $roles,
        array $nightsheet,
        array $reminders,
    ): array {
        $expanded = [];
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
            
            if (
                array_key_exists('reminders', $role)
                && is_array($role['reminders'])
            ) {
                $mappedReminders = array_map(function ($item) use ($reminders) {
                    if (array_key_exists($item, $reminders)) {
                        return $reminders[$item];
                    }

                    return '';
                }, $role['reminders']);
                $roleReminders = array_filter($mappedReminders, function ($item) {
                    return strlen($item) > 0;
                });

                if (count($roleReminders)) {
                    $cleanRole['reminders'] = $roleReminders;
                }
            }
            
            if (
                array_key_exists('remindersGlobal', $role)
                && is_array($role['remindersGlobal'])
            ) {
                $mappedReminders = array_map(function ($item) use ($reminders) {
                    if (array_key_exists($item, $reminders)) {
                        return $reminders[$item];
                    }

                    return '';
                }, $role['remindersGlobal']);
                $roleReminders = array_filter($mappedReminders, function ($item) {
                    return strlen($item) > 0;
                });

                if (count($roleReminders)) {
                    $cleanRole['remindersGlobal'] = $roleReminders;
                }
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

            $expanded[] = $cleanRole;
        }

        // I don't know why PHPStan is struggling with understanding these lines
        // even if I explicitly define $expanded. Ignore for now.
        usort(
            // @phpstan-ignore argument.unresolvableType
            $expanded,
            // @phpstan-ignore argument.unresolvableType
            function (array $a, array $b) {
                return $a['id'] <=> $b['id'];
            },
        );

        return $expanded;
    }

    /**
     * Cleans the given text to remove any instance of ":reminder:" (and any
     * extra spaces generated by that removal).
     *
     * @param string $nightReminder Night reminder to clean.
     * @return string Cleaned night reminder.
     */
    public function cleanNightReminder(string $nightReminder): string
    {
        $removed = str_replace(':reminder:', '', $nightReminder);
        $unspaced = preg_replace('/\s+/', ' ', $removed);
        
        // Fix the Po.
        $unorred = preg_replace('/\.\s+[a-z]\s+$/i', '', $unspaced);
        $despaced = preg_replace('/\s+/', ' ', $unorred);

        return (string) $despaced;
    }

    /**
     * Generates the images for the given role.
     *
     * @param string $id Role ID.
     * @param string $team Role's team.
     * @return array<string> Array of image locations.
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
