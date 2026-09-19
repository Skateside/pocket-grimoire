<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array{
 *  id: string,
 *  name: string,
 *  ability: string,
 *  flavor?: ?string,
 *  firstNightReminder?: ?string,
 *  otherNightReminder?: ?string,
 *  remindersGlobal?: ?string,
 *  reminders?: ?string,
 * }
 */
class CommunityRoleDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $id,

        #[Assert\NotBlank]
        public readonly string $name,

        #[Assert\NotBlank]
        public readonly string $ability,

        public readonly ?string $flavor,

        public readonly ?string $firstNightReminder,

        public readonly ?string $otherNightReminder,

        /** @var ?string[] $remindersGlobal */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $remindersGlobal,

        /** @var ?string[] $reminders */
        #[Assert\All([
            new Assert\NotBlank,
        ])]
        public readonly ?array $reminders,
    ) {}

    public function toArray(): array
    {
        $array = [
            'id' => $this->id,
            'name' => $this->name,
            'ability' => $this->ability,
        ];

        if ($this->flavor !== null) {
            $array['flavor'] = $this->flavor;
        }

        if ($this->firstNightReminder !== null) {
            $array['firstNightReminder'] = $this->firstNightReminder;
        }

        if ($this->otherNightReminder !== null) {
            $array['otherNightReminder'] = $this->otherNightReminder;
        }

        if (is_array($this->remindersGlobal)) {
            $array['remindersGlobal'] = implode(',', $this->remindersGlobal);
        }

        if (is_array($this->reminders)) {
            $array['reminders'] = implode(',', $this->reminders);
        }

        return $array;
    }

    /**
     * @param Data $role
     * @return self
     */
    public static function from(array $role): self
    {
        return new self(
            $role['id'],
            $role['name'],
            $role['ability'],
            static::empty2null($role['flavor'] ?? null),
            static::empty2null($role['firstNightReminder'] ?? null),
            static::empty2null($role['otherNightReminder'] ?? null),
            static::asList($role['remindersGlobal'] ?? null),
            static::asList($role['reminders'] ?? null),
        );
    }

    /**
     * Returns a trimmed string, or null if the string is empty (or it wasn't
     * provided).
     *
     * @param ?string $string String to trim.
     * @return ?string Trimmed string or null if the string is empty.
     */
    protected static function empty2null(?string $string): ?string
    {
        if (is_string($string)) {
            $trimmed = trim($string);

            return $trimmed === '' ? null : $trimmed;
        }

        return null;
    }

    /**
     * Converts the given string into a list of strings or returns null if the
     * string or list is/would be empty.
     *
     * @param ?string $string String to convert.
     * @return ?string[] Either the list or null if the list would be empty.
     */
    protected static function asList(?string $string): ?array
    {
        $value = static::empty2null($string);

        if (is_null($value)) {
            return null;
        }

        $list = [];

        foreach (explode(',', $string) as $item) {
            if (($trimmed = trim($item)) !== '') {
                $list[] = $trimmed;
            }
        }

        return count($list) ? $list : null;
    }
}
