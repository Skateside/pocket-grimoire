<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from TPIRoleExpandedDto as Role
 * @phpstan-type Data Role[]
 */
class TPIRolesExpandedDto implements DtoInterface
{
    public function __construct(
        /**
         * @var TPIRoleExpandedDto[] $roles
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
            return TPIRoleExpandedDto::from($tpiRole);
        }, $tpiRoles));
    }
}

