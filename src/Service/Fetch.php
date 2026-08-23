<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpClient\{
    HttpClient,
    NoPrivateNetworkHttpClient,
};
use League\Uri\Uri;

class Fetch
{
    /**
     * @var string $lastError The last error message that occurred.
     */
    protected string $lastError = '';

    private HttpClientInterface $client;

    public function __construct(
        HttpClientInterface $client
    ) {
        $this->client = new NoPrivateNetworkHttpClient(HttpClient::create());
    }

    /**
     * Since we have to deal with arbitrary URLs sometimes, this checks to see
     * whether or not the given URL is something that we would consider "safe".
     *
     * @param string $url URL to check.
     * @return bool|string If the URL is safe then true is returned, if the URL
     *         is not safe then a string explaining why the URL is not safe is
     *         returned.
     */
    public function isSafeUrl(string $url): bool|string
    {
        $parts = parse_url($url);

        if ($parts === false || !filter_var($url, FILTER_VALIDATE_URL)) {
            return 'error.url_not_valid';
        }

        if (($parts['scheme'] ?? '') !== 'https') {
            return 'error.url_https_only';
        }

        if (empty($parts['host'])) {
            return 'error.url_no_hostname';
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            return 'error.url_has_credentials';
        }

        if (isset($parts['port']) && $parts['port'] !== 443) {
            return 'error.url_port_not_443';
        }

        return true;
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
    /*public function getJson(string $source, bool $isAssoc = true): ?array
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
    }*/

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $url URL of the contents to get and parse.
     * @return ?array<mixed> Either the parsed array or null if an error
     *         occurred.
     */
    public function getJson(string $url): ?array
    {
        $this->resetLastError();

        if (($reason = $this->isSafeUrl($url)) !== true) {
            return $this->setLastError($reason);
        }

        for ($redirects = 0; $redirects <= 3; $redirects += 1) {
            $response = $this->client->request('GET', $url, [
                'max_redirects' => 0,
                'timeout' => 5,
                'max_duration' => 10,
            ]);

            $status = $response->getStatusCode();

            if ($status >= 300 && $status < 400) {
                $headers = $response->getHeaders(false);

                if (!isset($headers['location'][0])) {
                    return $this->setLastError('error.redirect_no_location');
                }

                $url = $this->resolveRedirectUrl($url, $headers['location'][0]);

                if (($reason = $this->isSafeUrl($url)) !== true) {
                    return $this->setLastError($reason);
                }

                continue;
            }

            if ($status !== 200) {
                return $this->setLastError(sprintf('error.http_status %d', $status));
            }

            return $response->toArray();
        }

        return $this->setLastError('error.too_many_redirects');
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
    protected function setLastError(string $lastError, $return = null)
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
     * Resolves a redirect URL, since it could be a relative or an absolute URL.
     *
     * @param string $currentUrl The current URL.
     * @param string $location The location given, which might be relative.
     * @return string The full redirect URL.
     */
    protected function resolveRedirectUrl(
        string $currentUrl,
        string $location,
    ): string {
        $base = Uri::new($currentUrl);
        $target = $base->resolve($location);

        return (string) $target;
    }
}
