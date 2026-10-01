<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from JinxEntryDto as JinxEntry
 * @phpstan-type Data array{
 *  id: string,
 *  jinx: JinxEntry[]
 * }
 */
class JinxDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        /**
         * @var JinxEntryDto[] $jinx
         */
        #[Assert\Valid]
        public readonly array $jinx,
    ) {
    }
}
