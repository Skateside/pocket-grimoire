<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, (string|array{
 *  id: '_meta',
 *  firstNight?: ?string[],
 *  otherNight?: ?string[],
 * })[]>
 */
class ScriptDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $id,

        /** @var string[] $roles */
        #[Assert\All([
            new Assert\NotBlank,
            new Assert\Regex(pattern: '/$[a-z]+$/'),
        ])]
        public readonly array $roles,

        /** @var ?array{id: '_meta', firstNight?: ?string[], otherNight?: ?string[]} $meta */
        public readonly ?array $meta,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        $array = [$this->id => $this->roles];

        if ($this->meta !== null) {
            array_unshift($array[$this->id], $this->meta);
        }

        return $array;
    }

    /**
     * @param Data $script
     * @return self
     */
    public static function from(array $script): self
    {
        $id = array_key_first($script);

        if ($id === null) {
            throw new \RuntimeException('Script missing ID');
        }

        $meta = null;

        foreach ($script[$id] as $index => $item) {
            if (is_array($item)) {
                $meta = $item;
                array_splice($script[$id], $index, 1);
                break;
            }
        }

        return new self(
            $id,
            $script[$id],
            $meta,
        );
    }
}
