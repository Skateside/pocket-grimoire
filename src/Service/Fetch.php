<?php

namespace App\Service;

class Fetch
{
    /**
     * Gets the status code from the given URL.
     *
     * @param string $source URL whose HTTP status code should be returned.
     * @return int Status code.
     */
    public function getStatusCode(string $source): int
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_URL => $source,
        ]);
        curl_exec($curl);
        $response_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        return $response_code;
    }

    /**
     * Gets the contents of the given URL.
     *
     * @param string $source URL whose contents should be returned.
     * @return string Contents from the given URL.
     */
    public function getContents(string $source): string
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $source,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => false,
        ]);
        $contents = curl_exec($curl);
        curl_close($curl);

        return $contents;
    }

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $source Source of the contents to get and parse.
     * @param bool isAssoc Whether to parse the JSON as an associative array or
     *        an object. Defaults to array.
     * @return array Results of parsing the contents (if possible).
     */
    public function getJson(string $source, bool $isAssoc = true): array
    {
        $status = $this->getStatusCode($source);

        if ($status < 200 || ($status >= 300 && $status !== 302)) {
            return $this->failure("'{$source}' status code response: {$status}");
        }

        $contents = $this->getContents($source);

        if ($contents === false) {
            return $this->failure("'{$source}' not found");
        }

        if (!$this->json_validate($contents)) {
            return $this->failure("'{$source}' not valid JSON");
        }

        $decoded = json_decode($contents, $isAssoc);

        if (!is_array($decoded)) {
            return $this->failure('JSON not an array');
        }

        return $this->success($decoded);
    }

    /**
     * Returns a success.
     *
     * @param mixed $data Body for the success response.
     * @return array Success response.
     */
    protected function success(mixed $data): array
    {
        return ['success' => true, 'body' => $data];
    }

    /**
     * Returns a failure.
     *
     * @param mixed $data Body for the failure response.
     * @return array Failure response.
     */
    protected function failure(mixed $data): array
    {
        return ['success' => false, 'body' => $data];
    }

    /**
     * Fallback for json_validate() for PHP before 8.3
     *
     * @param string $json JSON string to test.
     * @param int $depth Maximum depth of the JSON.
     * @param int $flags Settings flags.
     * @return bool true if the JSON is valid, false otherwise.
     * @see https://php.watch/versions/8.3/json_validate
     * @see https://www.php.net/manual/en/function.json-validate.php
     */
    protected function json_validate(string $json, int $depth = 512, int $flags = 0): bool
    {
        if (function_exists('json_validate')) {
            return \json_validate($json, $depth, $flags);
        }

        if ($flags !== 0 && $flags !== \JSON_INVALID_UTF8_IGNORE) {
            throw new \ValueError('json_validate(): Argument #3 ($flags) must be a valid flag (allowed flags: JSON_INVALID_UTF8_IGNORE)');
        }

        if ($depth <= 0) {
            throw new \ValueError('json_validate(): Argument #2 ($depth) must be greater than 0');
        }

        \json_decode($json, null, $depth, $flags);

        return \json_last_error() === \JSON_ERROR_NONE;
    }
}
