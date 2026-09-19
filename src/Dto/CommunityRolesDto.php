<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from CommunityRoleDto as Role
 * @phpstan-type Data Role[]
 */
class CommunityRolesDto implements DtoInterface
{
    public function __construct(
        /** @var CommunityRoleDto[] $roles */
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
     * @param Data $roles
     */
    public static function from(array $roles): self
    {
        return new self(array_map(function ($role) {
            return CommunityRoleDto::from($role);
        }, $roles));
    }
}

