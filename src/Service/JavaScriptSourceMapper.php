<?php

namespace App\Service;

use Symfony\Component\Process\Process;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class JavaScriptSourceMapper
{
    public function __construct(
        protected Storage $storage,
        protected CacheInterface $cache,
    ) {
    }

    /**
     * Resolves the minified information based on the given data and the
     * related source map.
     *
     * @param string $url URL that should be resolved.
     * @param int $line Minified line.
     * @param int $column Minified column.
     * @return ?array<string, string|null|int> Resolved information.
     */
    public function resolve(string $url, int $line, int $column): ?array
    {
        $asset = $this->getAssetFromUrl($url);

        if (is_null($asset)) {
            return null;
        }

        $mapFile = $this->storage->getFilename(
            Storage::LOCATION_PUBLIC_JS,
            "{$asset}.map",
        );

        if (!is_file($mapFile)) {
            return null;
        }

        $key = sprintf(
            'js_source_map.%s.%s.%d.%d',
            hash('sha256', $asset),
            filemtime($mapFile),
            $line,
            $column,
        );

        return $this->cache->get($key, function (ItemInterface $item) use (
            $mapFile,
            $line,
            $column,
        ): ?array {
            $item->expiresAfter(86400); // 24 hours

            return $this->runResolver($mapFile, $line, $column);
        });
    }

    /**
     * Maps the given stack from the minified file to the source map
     * information.
     *
     * @param string $stack JavaScript stack to convert.
     * @return array<string, string|array<string, string>> Converted stack.
     */
    public function mapStack(string $stack): array
    {
        return array_map(function (array $frame) {
            $source = $this->getAssetFromUrl($frame['url']);
            $original = null;

            if ($source !== null) {
                $original = $this->resolve(
                    $source,
                    $frame['line'],
                    $frame['column'],
                );
            }

            return [
                'function' => $frame['function'],
                'generated' => [
                    'url' => $frame['url'],
                    'line' => $frame['line'],
                    'column' => $frame['column'],
                ],
                'original' => $original,
            ];
        }, $this->parseStack($stack));
    }

    /**
     * Parses the given stack and converts it into frames. The stack will look
     * different depending on the browser - currently Chrome and Firefox are
     * only browsers handled.
     *
     * @param string $stack Raw stack to parse.
     * @return array<string, ?string> Parsed information.
     */
    protected function parseStack(string $stack): array
    {
        $frames = [];

        foreach (preg_split('/\R/', $stack) as $line) {
            $line = trim($line);

            /*
             * Chrome:
             * at foo (https://example.com/app.js:1:123)
             * or
             * at https://example.com/app.js:1:123
             */
            if (preg_match(
                '/^at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)\)?$/',
                $line,
                $matches,
            )) {
                $frames[] = [
                    'raw' => $line,
                    'function' => $matches[1] === '' ? null : $matches[1],
                    'url' => $matches[2],
                    'line' => (int) $matches[3],
                    'column' => (int) $matches[4],
                ];

                continue;
            }

            /*
             * Firefox:
             * foo@https://example.com/app.js:1:123
             */
            if (preg_match(
                '/^(.*?)@(.+?):(\d+):(\d+)$/',
                $line,
                $matches,
            )) {
                $frames[] = [
                    'raw' => $line,
                    'function' => $matches[1] === '' ? null : $matches[1],
                    'url' => $matches[2],
                    'line' => $matches[3],
                    'column' => $matches[4],
                ];
            }
        }

        return $frames;
    }

    /**
     * Runs the resolving process. As a seperate function, this can easily be
     * cached to avoid having to run it multiple times.
     *
     * @param string $mapFile Source map file.
     * @param int $line Minified line.
     * @param int $column Minified column.
     * @return ?array<string, string|null|int> Resolved information.
     */
    protected function runResolver(string $mapFile, int $line, int $column): ?array
    {
        $process = new Process([
            $this->storage->getFilename(
                Storage::LOCATION_TOOLS,
                'source-map-resolve',
            ),
        ]);

        $process->setInput(json_encode([
            'mapFile' => $mapFile,
            'line' => $line,
            'column' => $column,
        ], JSON_THROW_ON_ERROR));
        $process->setTimeout(2);
        $process->run();

        if (!$process->isSuccessful()) {
            return null;
        }

        $result = json_decode($process->getOutput(), true);

        if (!is_array($result) || isset($result['error'])) {
            return null;
        }

        if ($result['source'] === null || $result['line'] === null) {
            return null;
        }

        return $result;
    }

    /**
     * Gets the asset name from the given URL. The asset name is validated to
     * make sure it's an Encore file. null is returned if the URL can't be
     * parsed or the resulting asset name fails validation.
     *
     * @param string $url URL to convert.
     * @return ?string Converted asset or null on an error.
     */
    protected function getAssetFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);

        if (!is_string($path)) {
            return null;
        }

        $asset = basename($path);

        if (!preg_match('/^[a-zA-Z0-9._-]+\.js$/', $asset)) {
            return null;
        }

        return $asset;
    }
}
