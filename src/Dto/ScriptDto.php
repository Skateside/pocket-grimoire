<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type MetaEntry array{
 *  id: '_meta',
 *  firstNight?: ?string[],
 *  otherNight?: ?string[],
 * }
 * @phpstan-type Data array{
 *  key: string,
 *  item: (string|MetaEntry)[]
 * }
 */
class ScriptDto
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $key,

        /** @var string[] $roles */
        #[Assert\All([
            new Assert\NotBlank,
            new Assert\Regex(pattern: '/^[a-z]+$/'),
        ])]
        public readonly array $roles,

        /** @var ?array{id: '_meta', firstNight?: ?string[], otherNight?: ?string[]} $meta */
        public readonly ?array $meta,
    ) {}
}
