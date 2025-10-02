<?php

/**
 * Parses an ".env" file, returning its contents.
 * 
 * @param string $fileName File to parse.
 * @return array Parsed contents.
 * @see https://www.faqforge.com/php/how-to-parse-a-env-file-with-php/
 */
function parseEnvFile(string $fileName): array
{

    $env = [];
    $lines = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {

        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        $env[$name] = trim($value, '"');

    }

    return $env;

}

/**
 * Gets the local environment variables.
 * 
 * @return array Parsed environment file.
 */
function getLocalEnv(): array
{

    $path = realpath(dirname(__FILE__) . '/..');
    $env = [];
    $checks = ['', '.local'];

    foreach ($checks as $suffix) {

        $fileName = "{$path}/.env{$suffix}";

        if (file_exists($fileName)) {
            $env = array_merge($env, parseEnvFile($fileName));
        }

    }

    return $env;

}

/**
 * Get the contents of a Google spreadsheet tab.
 * 
 * @param string $key Identifier for the spreadsheet.
 * @param string $tabName Name of the tab.
 * @return string Contents of the spreadsheet tab.
 */
function getContents(string $key, string $tabName): string
{
    $tab = urlencode($tabName);
    return file_get_contents("https://docs.google.com/spreadsheets/d/{$key}/gviz/tq?tqx=out:csv&sheet={$tab}");
}

function getConfig(): array
{

    $env = getLocalEnv();

    return [
        'roles' => [
            'folder' => 'characters',
            'key' => $env['ROLES_KEY'],
            'tab-map' => [
                'de_DE' => 'de_DE (official)',
                'id_ID' => 'id_ID (Official)',
            ],
        ],
        'jinxes' => [
            'folder' => 'jinxes',
            'key' => $env['JINXES_KEY'],
        ],
        'i18n' => [
            'folder' => 'i18n',
            'key' => $env['I18N_KEY'],
        ],
    ];

}

function getLocales(): array
{

    $path = realpath(dirname(__FILE__) . '/..');
    $locales = [];

    foreach (scandir("{$path}/translations") ?: [] as $file) {

        $matches = [];
        preg_match('/^messages\.(\w+)\.yaml$/', $file, $matches);

        if (count($matches) > 1) {
            $locales[] = $matches[1];
        }

    }

    return $locales;

}

function emptyDirectory(string $directory)
{

    foreach (glob("{$directory}/*") as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }

}

function getDirectory(string $type): string
{
    $path = realpath(dirname(__FILE__) . '/../ideas');
    return "{$path}/diff/{$type}";
}

function makeEmptyDirectory(string $directory)
{
    mkdir($directory, 0755, true);
    emptyDirectory($directory);
}

function runDownload(string $type)
{

    $config = getConfig()[$type];
    $directory = getDirectory($type);

    makeEmptyDirectory($directory);

    foreach (getLocales() as $locale) {

        echo " - Downloading {$locale} ... \r";
        $contents = getContents(
            $config['key'],
            $config['tab-map'][$locale] ?? $locale
        );
        file_put_contents("{$directory}/{$locale}.csv", $contents);
        echo " - Downloaded {$locale}" . str_repeat(' ', 20) . PHP_EOL;

    }

}

function runDiff(string $type)
{

    $config = getConfig()[$type];
    $directory = getDirectory($type);
    $tempDir = "{$directory}/temp";
    $destDir = "{$directory}/diff";

    makeEmptyDirectory($tempDir);
    makeEmptyDirectory($destDir);

    foreach (getLocales() as $locale) {

        echo " - Downloading {$locale} ... \r";
        $contents = getContents(
            $config['key'],
            $config['tab-map'][$locale] ?? $locale
        );
        file_put_contents("{$tempDir}/{$locale}.csv", $contents);
        echo " - Downloaded {$locale}" . str_repeat(' ', 20);

        xdiff_file_diff(
            "{$directory}/{$locale}.csv",
            "{$tempDir}/{$locale}.csv",
            "{$destDir}/{$locale}.csv",
        );
        echo " - Diffed {$locale}" . str_repeat(' ', 20) . PHP_EOL;

    }

}

function run()
{

    $type = 'i18n';
    $command = ['download', 'diff'][1];

    switch ($command) {

        case 'download':
            
            echo 'Downloading ...' . PHP_EOL;
            $start = microtime(true);
            runDownload($type);
            $duration = microtime(true) - $start;
            echo "... done in {$duration}s" . PHP_EOL;
            break;
        
        case 'diff':

            echo 'Diffing ...' . PHP_EOL;
            $start = microtime(true);
            runDiff($type);
            $duration = microtime(true) - $start;
            echo "... done in {$duration}s" . PHP_EOL;
            break;

    }

}

run();
