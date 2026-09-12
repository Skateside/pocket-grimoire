<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from JinxEntryDto as JinxEntry
 * @phpstan-type Data array{
 *  id: string,
 *  jinx: JinxEntry[]
 * }
 */
class JinxDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-z]+$/')]
        public readonly string $id,

        /**
         * @var JinxEntryDto[] $jinx
         */
        #[Assert\Valid]
        public readonly array $jinx,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'jinx' => array_map(function ($jinx) {
                return $jinx->toArray();
            }, $this->jinx),
        ];
    }

    /**
     * @param Data $jinx
     */
    public static function from(array $jinx): self
    {
        return new self(
            $jinx['id'],
            array_map(function ($jinx) {
                return JinxEntryDto::from($jinx);
            }, $jinx['jinx']),
        );
    }
}
