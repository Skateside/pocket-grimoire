<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, string>
 */
class TranslationJinxDto implements DtoInterface
{
    public function __construct(
        #[Assert\Regex(pattern: '/^[a-z]+\-[a-z]+/')]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $reason,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [$this->key => $this->reason];
    }

    /**
     * @param Data $jinx
     * @return self
     */
    public static function from(array $jinx): self
    {
        $key = array_key_first($jinx);

        if ($key === null) {
            throw new \RuntimeException('TPI Jinx missing key');
        }

        return new self($key, $jinx[$key]);
    }
}
