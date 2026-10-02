<?php

namespace App\Service;

use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class DataValidator
{ 
    public function __construct(
        protected ValidatorInterface $validator,
    ) {}

    /**
     * Validates that the given data would be valid if converted into the given
     * type.
     *
     * @param mixed $data Data to validate.
     * @return array<string, string[]> Human-readable violations.
     */
    public function validate(mixed $data): array
    {
        $violations = $this->validator->validate($data);

        return $this->convertViolations($violations);
    }

    /**
     * Filters out any invalid entries from the given array.
     *
     * @template Type of array<mixed>
     * @param Type $data Data to filter.
     * @return Type Valid entries.
     */
    public function filterValid(array $data): array
    {
        return array_filter($data, function ($item) {
            return count($this->validator->validate($item)) === 0;
        });
    }

    /**
     * Converts the violations into a more human-readable format.
     *
     * @param ConstraintViolationListInterface $violations Violations that
     * should be logged.
     * @return array<string, string[]> Human-readable violations.
     */
    public function convertViolations(ConstraintViolationListInterface $violations): array
    {
        $converted = [];

        foreach ($violations as $violation) {
            $converted[$violation->getPropertyPath()][] = (string) $violation->getMessage();
        }

        return $converted;
    }

    /**
     * Converts the violations into a string.
     *
     * @param array<string, string[]> $violations
     * @return string A string containing any violations.
     */
    public function stringifyViolations(array $violations): string
    {
        $strings = [];

        foreach ($violations as $path => $messages) {
            $inner = [$path];

            foreach ($messages as $message) {
                $inner[] = "\t" . $message;
            }

            $strings[] = implode(PHP_EOL, $inner);
        }

        return implode(PHP_EOL, $strings);
    }
}
