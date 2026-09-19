<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from TranslationRoleDto as Role
 * @phpstan-type Data Role
 */
class TranslationRolesDto implements DtoInterface
{
    public function __construct(
        /** @var TranslationRoleDto[] $roles */
        #[Assert\Valid]
        public readonly array $roles,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_merge(...array_map(function ($role) {
            return $role->toArray();
        }, $this->roles));
    }

    /**
     * @param Data $roles
     */
    public static function from(array $roles): self
    {
        return new self(array_map(function ($key, $value) {
            return TranslationRoleDto::from([$key => $value]); 
        }, array_keys($roles), array_values($roles)));
    }
}

