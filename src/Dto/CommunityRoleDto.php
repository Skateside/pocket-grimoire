<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  name: string,
 *  ability: string,
 *  flavor?: ?string,
 *  firstNightReminder?: ?string,
 *  otherNightReminder?: ?string,
 *  remindersGlobal?: ?string,
 *  reminders?: ?string,
 * }
 */
class CommunityRoleDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $id,

        #[Assert\NotBlank]
        public readonly string $name,

        #[Assert\NotBlank]
        public readonly string $ability,

        public readonly ?string $flavor,

        public readonly ?string $firstNightReminder,

        public readonly ?string $otherNightReminder,

        /** @var ?string[] $remindersGlobal */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $remindersGlobal,

        /** @var ?string[] $reminders */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $reminders,
    ) {}
}
