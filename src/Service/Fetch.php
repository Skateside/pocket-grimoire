<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\HttpClient\{
    HttpClient,
    NoPrivateNetworkHttpClient,
};
use League\Uri\Uri;

class Fetch
{
    /**
     * @var array{0: string, 1: array<string, string>} $lastError The last error that occurred.
     */
    protected array $lastError;

    protected HttpClientInterface $client;

    public function __construct(
        HttpClientInterface $client
    ) {
        $this->client = new NoPrivateNetworkHttpClient(HttpClient::create());
        $this->lastError = [''];
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
            return 'errors.url.no_url';
        }

        if (($parts['scheme'] ?? '') !== 'https') {
            return 'errors.url.https_only';
        }

        if (empty($parts['host'])) {
            return 'errors.url.no_hostname';
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            return 'errors.url.has_credentials';
        }

        if (isset($parts['port']) && $parts['port'] !== 443) {
            return 'errors.url.port_not_443';
        }

        return true;
    }

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
            $this->setLastError($reason);
            return null;
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
                    $this->setLastError('errors.url.redirect_no_location');
                    return null;
                }

                $url = $this->resolveRedirectUrl($url, $headers['location'][0]);

                if (($reason = $this->isSafeUrl($url)) !== true) {
                    $this->setLastError($reason);
                    return null;
                }

                continue;
            }

            if ($status !== 200) {
                $this->setLastError('errors.url.http_status', ['%code%' => $status]);
                return null;
            }

            return $response->toArray();
        }

        $this->setLastError('errors.url.too_many_redirects');
        return null;
    }

    /**
     * Gets the last error message, which will be an empty string if no error
     * has occured.
     *
     * @return string Last error message.
     */
    public function getLastError(?TranslatorInterface $translator = null): string
    {
        $error = $this->lastError[0];

        if (!is_null($translator)) {
            $error = $translator->trans($error, $this->lastError[1]);
        }

        return $error;
    }

    /**
     * Helper function for setting the last error message and returning null.
     *
     * @param string $lastError Last error message.
     * @param array<string, string> $placeholders Contents for placeholders.
     * @return mixed Whatever was passed as the return value.
     */
    protected function setLastError(string $lastError, array $placeholders = []): void
    {
        $this->lastError = [$lastError, $placeholders];
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
