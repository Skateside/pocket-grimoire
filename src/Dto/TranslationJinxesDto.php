<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from TranslationJinxDto as Jinx
 * @phpstan-type Data Jinx
 */
class TranslationJinxesDto implements DtoInterface
{
    public function __construct(
        /** @var TranslationJinxDto[] $items */
        #[Assert\Valid]
        public readonly array $items,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_merge(...array_map(function ($item) {
            return $item->toArray();
        }, $this->items));
    }

    /**
     * @param Data $items
     */
    public static function from(array $items): self
    {
        return new self(array_map(function ($key, $value) {
            return TranslationJinxDto::from([$key => $value]); 
        }, array_keys($items), array_values($items)));
    }
}

