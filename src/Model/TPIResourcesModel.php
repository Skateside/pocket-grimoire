<?php

namespace App\Model;

use App\Dto\{
    NightsheetDto,
    TPIRemindersDto,
    TPIRolesDto,
};

/**
 * @phpstan-import-type Data from \App\Dto\TPIRemindersExpandedDto as TPIRemindersExpanded
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
     * @param TPIRemindersDto $reminders Reminders to expand.
     * @param TPIRolesDto $roles Roles that have the reminder texts in them.
     * @return TPIRemindersExpanded Expanded reminders.
     */
    public function expandReminders(
        TPIRemindersDto $reminders,
        TPIRolesDto $roles
    ): array {
        $expanded = [];

        foreach ($reminders->items as $reminder) {
            $text = $reminder->text;
            $entry = [
                'text' => $text,
                'examples' => [],
            ];

            foreach ($roles->items as $role) {
                if (($index = array_search($text, $role->reminders ?? [])) !== false) {
                    $entry['examples'][] = "{$role->id}.r.{$index}";
                }
                if (($index = array_search($text, $role->remindersGlobal ?? [])) !== false) {
                    $entry['examples'][] = "{$role->id}.g.{$index}";
                }
            }

            $expanded[$reminder->key] = $entry;
        }

        return $expanded;
    }

    /**
     * Expand the roles data into something that can be used.
     *
     * @param TPIRolesDto $roles Roles to expand.
     * @param NightsheetDto $nightsheet Nightsheet for the roles.
     * @param TPIRemindersDto $reminders Reversed reminders.
     * @return TPIRolesExpanded Expanded roles.
     */
    public function expandRoles(
        TPIRolesDto $roles,
        NightsheetDto $nightsheet,
        TPIRemindersDto $reminders,
    ): array {
        $expanded = [];
        $mappedReminders = $this->mapReminders($reminders);

        foreach ($roles->items as $role) {
            $cleanRole = [
                'id' => $role->id,
                'name' => $role->name,
                'team' => $role->team,
                'edition' => $role->edition,
                'setup' => $role->setup,
                'ability' => $role->ability,
                'flavor' => $role->flavor,
            ];
            
            if (is_array($role->reminders)) {
                $mapped = array_map(function ($item) use ($mappedReminders) {
                    if (array_key_exists($item, $mappedReminders)) {
                        return $mappedReminders[$item];
                    }

                    return '';
                }, $role->reminders);
                $roleReminders = array_filter($mapped, function ($item) {
                    return strlen($item) > 0;
                });

                if (count($roleReminders)) {
                    $cleanRole['reminders'] = $roleReminders;
                }
            }
            
            if (is_array($role->remindersGlobal)) {
                $mapped = array_map(function ($item) use ($mappedReminders) {
                    if (array_key_exists($item, $mappedReminders)) {
                        return $mappedReminders[$item];
                    }

                    return '';
                }, $role->remindersGlobal);
                $roleReminders = array_filter($mapped, function ($item) {
                    return strlen($item) > 0;
                });

                if (count($roleReminders)) {
                    $cleanRole['remindersGlobal'] = $roleReminders;
                }
            }

            if (
                !is_null($role->firstNightReminder)
                && in_array($role->id, $nightsheet->firstNight)
            ) {
                $cleanRole['firstNight'] = array_search($role->id, $nightsheet->firstNight) + 1;
                $cleanRole['firstNightReminder'] = $this->cleanNightReminder($role->firstNightReminder);
            }

            if (
                !is_null($role->otherNightReminder)
                && in_array($role->id, $nightsheet->otherNight)
            ) {
                $cleanRole['otherNight'] = array_search($role->id, $nightsheet->otherNight) + 1;
                $cleanRole['otherNightReminder'] = $this->cleanNightReminder($role->otherNightReminder);
            }

            $cleanRole['image'] = $this->generateImages($role->id, $role->team);

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
    protected function cleanNightReminder(string $nightReminder): string
    {
        $removed = str_replace(':reminder:', '', $nightReminder);
        $unspaced = preg_replace('/\s+/', ' ', $removed);
        
        // Fix the Po.
        $unorred = preg_replace('/\.\s+[a-z]\s+$/i', '', $unspaced);
        $despaced = preg_replace('/\s+/', ' ', $unorred);

        return (string) $despaced;
    }

    /**
     * Converts the reminders into a map of the translations to the keys.
     *
     * @param TPIRemindersDto $reminders Reminders.
     * @return array<string, string> Mapped reminders.
     */
    protected function mapReminders(TPIRemindersDto $reminders): array
    {
        $mapped = [];

        foreach ($reminders->items as $reminder) {
            $mapped[$reminder->text] = $reminder->key;
        }

        return $mapped;
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
