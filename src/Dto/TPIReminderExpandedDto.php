<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  key: string,
 *  text: string,
 *  examples: string[],
 * }
 */
class TPIReminderExpandedDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $text,

        /**
         * @var string[] $examples
         */
        #[Assert\All(
            new Assert\Regex(pattern: '/^[a-z]+\.[rg]\.\d+$/')
        )]
        public readonly array $examples,
    ) {
    }
}
