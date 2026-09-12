<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class JinxesDto implements DtoInterface
{
    public function __construct(
        /**
         * @var array<JinxDto> $jinxes
         */
        #[Assert\Valid]
        public readonly array $jinxes,
    ) {
    }

    public function toArray(): array
    {
        return array_map(function ($jinx) {
            return $jinx->toArray();
        }, $this->jinxes);
    }

    public static function from(array $jinxes): self
    {
        return new self(array_map(function ($jinx) {
            return JinxDto::from($jinx);
        }, $jinxes));
    }
}
