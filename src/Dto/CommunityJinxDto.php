<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  target: string,
 *  trick: string,
 *  reason: string
 * }
 */
class CommunityJinxDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $target,

        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $trick,

        #[Assert\NotBlank]
        #[Assert\Length(min: 1)]
        public readonly ?string $reason,
    ) {}
}
