<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from ScriptDto as Reminder
 * @phpstan-type Data Reminder
 */
class ScriptsDto implements DtoInterface
{
    public function __construct(
        /** @var ScriptDto[] $items */
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
            return ScriptDto::from([$key => $value]); 
        }, array_keys($items), array_values($items)));
    }
}

