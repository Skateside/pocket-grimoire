<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  reason: string,
 * }
 */
class JinxEntryDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        #[Assert\NotBlank]
        #[Assert\Length(min: 1)]
        public readonly string $reason,
    ) {
    }
}
