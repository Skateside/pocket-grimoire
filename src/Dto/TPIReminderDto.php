<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, string>
 */
class TPIReminderDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $value,
    ) {}

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [$this->key => $this->value];
    }

    /**
     * @param Data $reminder
     */
    public static function from(array $reminder): self
    {
        $key = array_key_first($reminder);

        if ($key === null) {
            throw new \RuntimeException('TPI Reminder missing key');
        }

        return new self($key, $reminder[$key]);
    }
}
