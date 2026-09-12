<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  reason: string,
 * }
 */
class JinxEntryDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        #[Assert\NotBlank]
        #[Assert\Length(min: 1)]
        public readonly string $reason,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
        ];
    }

    /**
     * @param Data $jinx
     */
    public static function from(array $jinx): self
    {
        return new self(
            $jinx['id'],
            $jinx['reason'],
        );
    }
}
