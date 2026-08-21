<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class Fetch
{
    /**
     * @var string $lastError The last error message that occurred.
     */
    protected string $lastError = '';

    public function __construct(
        private HttpClientInterface $client,
    ) {
    }

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $source Source of the contents to get and parse.
     * @param bool $isAssoc Whether to parse the JSON as an associative array or
     *        an object. Defaults to array.
     * @return ?array<mixed> Either the parsed array or null if an error
     *         occurred.
     */
    public function getJson(string $source, bool $isAssoc = true): ?array
    {
        $this->resetLastError();

        try {
            $response = $this->client->request('GET', $source, [
                'max_redirects' => 3,
                'timeout' => 5,
                'max_duration' => 10,
            ]);

            $status = $response->getStatusCode();

            if ($status < 200 || ($status >= 300 && $status !== 302)) {
                return $this->setLastError("Status code response {$status}");
            }

            return $response->toArray();
        } catch (\Throwable $error) {
            return $this->setLastError($error->getMessage());
        }
    }

    /**
     * Gets the last error message, which will be an empty string if no error
     * has occured.
     *
     * @return string Last error message.
     */
    public function getLastError(): string
    {
        return $this->lastError;
    }

    /**
     * Helper function for setting the last error message and returning null.
     *
     * @param string $lastError Last error message.
     * @param mixed $return The value to return.
     * @return mixed Whatever was passed as the return value.
     */
    protected function setLastError(string $lastError, mixed $return = null): mixed
    {
        $this->lastError = $lastError;
        return $return;
    }

    /**
     * Helper function for resetting the last error message.
     */
    protected function resetLastError(): void
    {
        $this->setLastError('');
    }

    /**
     * Converts a number of bytes into a human-readable format.
     *
     * @param int $bytes Bytes to convert.
     * @param int $decimals Optional number of decimals, defaults to 2.
     * @return string Human-readable bytes.
     */
    public static function formatBytes(int $bytes, int $decimals = 2): string
    {
        $size = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        $factor = intval(floor((strlen((string) $bytes) - 1) / 3));

        if ($factor === 0) {
            $decimals = 0;
        }

        return sprintf("%.{$decimals}f %s", $bytes / (1024 ** $factor), $size[$factor]);
    }
}
