<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  ability?: ?string,
 *  first?: ?string,
 *  flavor?: ?string,
 *  name?: ?string,
 *  other?: ?string,
 * }
 */
class TranslationRoleDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $id,

        public readonly ?string $ability,

        public readonly ?string $first,

        public readonly ?string $flavor,

        public readonly ?string $name,

        public readonly ?string $other,
    ) {}
}
