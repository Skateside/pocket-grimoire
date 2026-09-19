<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, array{
 *  ability?: ?string,
 *  first?: ?string,
 *  flavor?: ?string,
 *  name?: ?string,
 *  other?: ?string,
 * }>
 */
class TranslationRoleDto implements DtoInterface
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

    /**
     * @return Data
     */
    public function toArray(): array
    {
        $data = [];

        if ($this->ability !== null) {
            $data['ability'] = $this->ability;
        }

        if ($this->first !== null) {
            $data['first'] = $this->first;
        }

        if ($this->flavor !== null) {
            $data['flavor'] = $this->flavor;
        }

        if ($this->name!== null) {
            $data['name'] = $this->name;
        }

        if ($this->other !== null) {
            $data['other'] = $this->other;
        }

        return [$this->id => $data];
    }

    /**
     * @param Data $role
     * @return self
     */
    public static function from(array $role): self
    {
        $id = array_key_first($role);

        if ($id === null) {
            throw new \RuntimeException('Translation role midding ID');
        }

        return new self(
            $id,
            static::empty2null($role[$id]['ability'] ?? null),
            static::empty2null($role[$id]['first'] ?? null),
            static::empty2null($role[$id]['flavor'] ?? null),
            static::empty2null($role[$id]['name'] ?? null),
            static::empty2null($role[$id]['other'] ?? null),
        );
    }
    
    /**
     * Returns a trimmed string, or null if the string is empty (or null was
     * given).
     *
     * @param ?string $string String to trim.
     * @return ?string Trimmed string or null.
     */
    protected static function empty2null(?string $string): ?string
    {
        if (is_string($string)) {
            $trimmed = trim($string);

            return $trimmed === '' ? null : $trimmed;
        }

        return null;
    }
}
