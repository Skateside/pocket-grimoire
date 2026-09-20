<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from GameDto as Game
 * @phpstan-type Data Game[]
 */
class GamesDto implements DtoInterface
{
    public function __construct(
        /**
         * @var GameDto[] $items
         */
        #[Assert\Valid]
        public readonly array $items,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_map(function ($item) {
            return $item->toArray();
        }, $this->items);
    }

    /**
     * @param Data $items
     */
    public static function from(array $items): self
    {
        return new self(array_map(function ($item) {
            return GameDto::from($item);
        }, $items));
    }
}

