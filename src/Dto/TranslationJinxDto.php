<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, string>
 */
class TranslationJinxDto
{
    public function __construct(
        #[Assert\Regex(pattern: '/^[a-z]+\-[a-z]+/')]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $reason,
    ) {}
}
