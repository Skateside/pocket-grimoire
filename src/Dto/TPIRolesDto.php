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
         * @var TPIRoleDto[] $roles
         */
        #[Assert\Valid]
        public readonly array $roles,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_map(function ($role) {
            return $role->toArray();
        }, $this->roles);
    }

    /**
     * @param Data $tpiRoles
     */
    public static function from(array $tpiRoles): self
    {
        return new self(array_map(function ($tpiRole) {
            return TPIRoleDto::from($tpiRole);
        }, $tpiRoles));
    }
}
