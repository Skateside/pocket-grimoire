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
        /** @var TranslationJinxDto[] $reminders */
        #[Assert\Valid]
        public readonly array $reminders,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_merge(...array_map(function ($reminder) {
            return $reminder->toArray();
        }, $this->reminders));
    }

    /**
     * @param Data $jinxes
     */
    public static function from(array $jinxes): self
    {
        return new self(array_map(function ($key, $value) {
            return TranslationJinxDto::from([$key => $value]); 
        }, array_keys($jinxes), array_values($jinxes)));
    }
}

