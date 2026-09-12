<?php

namespace App\Dto;

interface DtoInterface
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(): array;

    /**
     * @param array<string, mixed> $rawData
     * @return self
     */
    public static function from(array $rawData): self;
}
