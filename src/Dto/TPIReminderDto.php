<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  key: string,
 *  text: string,
 * }
 */
class TPIReminderDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $text,
    ) {}
}
