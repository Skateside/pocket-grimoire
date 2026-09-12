<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-import-type Data from TPIReminderDto as Reminder
 * @phpstan-type Data Reminder
 */
class TPIRemindersDto implements DtoInterface
{
    public function __construct(
        /** @var TPIReminderDto[] $reminders */
        #[Assert\Valid]
        public readonly array $reminders,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return array_merge(...array_map(function ($reminder) {
            return $reminder->toArray();
        }, $this->reminders));
    }

    /**
     * @param Data $reminders
     */
    public static function from(array $reminders): self
    {
        return new self(array_map(function ($key, $value) {
            return TPIReminderDto::from([$key => $value]); 
        }, array_keys($reminders), array_values($reminders)));
    }
}
