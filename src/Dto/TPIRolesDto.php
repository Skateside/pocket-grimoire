<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from TPIRoleDto as Role
 * @phpstan-type Data Role[]
 */
class TPIRolesDto implements DtoInterface
{
    public function __construct(
        /**
         * @var TPIRoleDto[] $items
         */
        #[Assert\Valid]
        public readonly array $items,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_map(function ($item) {
            return $item->toArray();
        }, $this->items);
    }

    /**
     * @param Data $items
     */
    public static function from(array $items): self
    {
        return new self(array_map(function ($item) {
            return TPIRoleDto::from($item);
        }, $items));
    }
}
