<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  name: string,
 *  edition: string,
 *  team: string,
 *  setup: bool,
 *  ability: string,
 *  flavor: string,
 *  firstNightReminder?: ?string,
 *  otherNightReminder?: ?string,
 *  reminders?: ?string[],
 *  remindersGlobal?: ?string[],
 * }
 */
class TPIRoleDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        #[Assert\NotBlank]
        public readonly string $name,

        #[Assert\Choice(choices: [
            'tb',
            'snv',
            'bmr',
            'carousel',
            'fabled',
            'loric',
        ])]
        public readonly string $edition,

        #[Assert\Choice(choices: [
            'townsfolk',
            'outsider',
            'minion',
            'demon',
            'traveller',
            'fabled',
            'loric',
        ])]
        public readonly string $team,

        public readonly bool $setup,

        #[Assert\NotBlank]
        public readonly string $ability,

        public readonly string $flavor,

        public readonly ?string $firstNightReminder,

        public readonly ?string $otherNightReminder,

        /**
         * @var ?array<string> $reminders
         */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $reminders,

        /**
         * @var ?array<string> $remindersGlobal
         */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $remindersGlobal,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        $array = [
            'id' => $this->id,
            'name' => $this->name,
            'edition' => $this->edition,
            'team' => $this->team,
            'setup' => $this->setup,
            'ability' => $this->ability,
            'flavor' => $this->flavor,
        ];

        if (!is_null($this->firstNightReminder)) {
            $array['firstNightReminder'] = $this->firstNightReminder;
        }

        if (!is_null($this->otherNightReminder)) {
            $array['otherNightReminder'] = $this->otherNightReminder;
        }

        if (!is_null($this->reminders)) {
            $array['reminders'] = $this->reminders;
        }

        if (!is_null($this->remindersGlobal)) {
            $array['remindersGlobal'] = $this->remindersGlobal;
        }

        return $array;
    }

    /**
     * @param Data $tpiRole
     */
    public static function from(array $tpiRole): self
    {
        return new self(
            $tpiRole['id'],
            $tpiRole['name'],
            $tpiRole['edition'],
            $tpiRole['team'],
            $tpiRole['setup'],
            $tpiRole['ability'],
            $tpiRole['flavor'],
            $tpiRole['firstNightReminder'] ?? null,
            $tpiRole['otherNightReminder'] ?? null,
            $tpiRole['reminders'] ?? null,
            $tpiRole['remindersGlobal'] ?? null,
        );
    }
}

