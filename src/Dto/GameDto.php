<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  players: int,
 *  breakdown: array{
 *      townsfolk: int,
 *      outsider: int,
 *      minion: int,
 *      demon: int,
 *  },
 * }
 */
class GameDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        public readonly int $players,

        /** @var array<'townsfolk' | 'outsider' | 'minion' | 'demon', int> */
        #[Assert\All([
            new Assert\PositiveOrZero,
        ])]
        public readonly array $breakdown,
    ) {}
}
