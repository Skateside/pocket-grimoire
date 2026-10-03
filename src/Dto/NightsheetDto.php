<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  firstNight: string[],
 *  otherNight: string[],
 * }
 */
class NightsheetDto
{
    public function __construct(
        /**
         * @var string[] $firstNight
         */
        #[Assert\All([
            new Assert\NotBlank,
            new Assert\Regex(pattern: '/^[a-z]+$/'),
        ])]
        public readonly array $firstNight,

        /**
         * @var string[] $otherNight
         */
        #[Assert\All([
            new Assert\NotBlank,
            new Assert\Regex(pattern: '/^[a-z]+$/'),
        ])]
        public readonly array $otherNight,
    ) {
    }
}
