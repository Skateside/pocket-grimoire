<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class JinxDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        /**
         * @var array<JinxEntryDto> $jinx
         */
        #[Assert\Valid]
        public readonly array $jinx,
    ) {
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'jinx' => array_map(function ($jinx) {
                return $jinx->toArray();
            }, $this->jinx),
        ];
    }

    public static function from(array $jinx): self
    {
        return new self(
            $jinx['id'] ?? null,
            array_map(function ($jinx) {
                return JinxEntryDto::from($jinx);
            }, $jinx['jinx'] ?? []),
        );
    }
}
