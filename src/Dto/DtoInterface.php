<?php

namespace App\Dto;

/**
 * @phpstan-type Data array<int|string, mixed>
 */
interface DtoInterface
{
    /**
     * @return Data
     */
    public function toArray(): array;

    /**
     * @param Data $rawData
     * @return self
     */
    public static function from(array $rawData): self;
}
