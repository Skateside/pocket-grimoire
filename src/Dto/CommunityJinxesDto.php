<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from CommunityJinxDto as Jinx
 * @phpstan-type Data Jinx[]
 */
class CommunityJinxesDto implements DtoInterface
{
    public function __construct(
        /**
         * @var CommunityJinxDto[] $jinxes
         */
        #[Assert\Valid]
        public readonly array $jinxes,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_map(function ($jinx) {
            return $jinx->toArray();
        }, $this->jinxes);
    }

    /**
     * @param Data $jinxes
     */
    public static function from(array $jinxes): self
    {
        return new self(array_map(function ($jinx) {
            return CommunityJinxDto::from($jinx);
        }, $jinxes));
    }
}
