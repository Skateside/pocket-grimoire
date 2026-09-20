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
class GameDto implements DtoInterface
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

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [
            'players' => $this->players,
            'breakdown' => $this->breakdown,
        ];
    }

    /**
     * @param Data $game
     * @return self
     */
    public static function from(array $game): self
    {
        return new self(
            $game['players'],
            $game['breakdown'],
        );
    }
}
