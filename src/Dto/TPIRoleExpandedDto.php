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
 *  flavor?: ?string,
 *  image: string[],
 *  firstNight?: ?int,
 *  firstNightReminder?: ?string,
 *  otherNight?: ?int,
 *  otherNightReminder?: ?string,
 *  reminders?: ?string[],
 *  remindersGlobal?: ?string[],
 * }
 */
class TPIRoleExpandedDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z0-9]+$/')]
        public readonly string $id,

        #[Assert\NotBlank]
        public readonly string $name,

        #[Assert\Regex(pattern: '/^[a-z]+$/')]
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

        public readonly ?string $flavor,

        /** @var string[] $image */
        #[Assert\All([
            new Assert\NotBlank,
            new Assert\Regex(pattern: '/[a-z0-9]+(?:_[ge])?\.webp$/'),
        ])]
        public readonly array $image,

        #[Assert\Positive]
        public readonly ?int $firstNight,

        public readonly ?string $firstNightReminder,

        #[Assert\Positive]
        public readonly ?int $otherNight,

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
}
