<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  target: string,
 *  trick: string,
 *  reason: string
 * }
 */
class CommunityJinxDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $target,

        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $trick,

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
            'target' => $this->target,
            'trick' => $this->trick,
            'reason' => $this->reason,
        ];
    }

    /**
     * @param Data $jinx
     */
    public static function from(array $jinx): self
    {
        return new self(
            $jinx['target'],
            $jinx['trick'],
            $jinx['reason'],
        );
    }
}
