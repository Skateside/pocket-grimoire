<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @phpstan-type Data array<string, array{
 *  text: string,
 *  examples: string[],
 * }>
 */
class TPIReminderExpandedDto implements DtoInterface
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly string $key,

        #[Assert\NotBlank]
        public readonly string $text,

        /**
         * @var string[] $examples
         */
        #[Assert\All(
            new Assert\Regex(pattern: '/^[a-z]+\.[rg]\.\d+$/')
        )]
        public readonly array $examples,
    ) {
    }

    /**
     * @return Data
     */
    public function toArray(): array
    {
        return [
            $this->key => [
                'text' => $this->text,
                'examples' => $this->examples,
            ],
        ];
    }

    /**
     * @param Data $reminder
     */
    public static function from(array $reminder): self
    {
        $key = array_key_first($reminder);

        return new self(
            $key,
            $reminder[$key]['text'],
            $reminder[$key]['examples'],
        );
    }
}
