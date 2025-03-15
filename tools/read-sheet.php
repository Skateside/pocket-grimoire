<?php

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

/**
 * Parse the given contents as a CSV.
 * 
 * @param string $contents Raw CSV content.
 * @return array Parsed CSV.
 */
function parseCSV(string $contents): array
{

    $temp = tmpfile();
    fwrite($temp, $contents);
    fseek($temp, 0);

    $data = [];
    while (($line = fgetcsv($temp)) !== false) {
        $data[] = $line;
    }

    fclose($temp);

    return $data;

}

/**
 * Takes a parsed CSV and converts the first row into headers, returning an
 * associative array with those headers as the keys.
 * 
 * @param array $array Data including headers.
 * @return array Data with headers as keys.
 */
function makeAssocArray(array $array): array
{

    $headers = array_shift($array);

    return array_map(function (array $line) use ($headers) {
        return array_combine($headers, $line);
    }, $array);

}

/**
 * Updates the given data based on information in the map.
 * 
 * @param array $assoc Data to update.
 * @param array $map Optional map for updating the data.
 * @return array Updated data.
 */
function updateAssoc(array $assoc, array $map = [])
{

    return array_map(function ($entry) use ($map) {

        foreach ($entry as $key => $value) {

            $lcfirst = lcfirst($key);

            if ($key !== $lcfirst) {
                $entry[$lcfirst] = $entry[$key];
                unset($entry[$key]);
                $key = $lcfirst;
            }

            if (!array_key_exists($key, $map)) {
                continue;
            }

            if (is_null($map[$key])) {
                unset($entry[$key]);
            }

            if (is_callable($map[$key])) {
                $entry[$key] = $map[$key]($value);
            }

        }

        return $entry;

    }, $assoc);

}

/**
 * Gets the filename for the JSON file that we'll be manipulating.
 * 
 * @param string $folder Folder that should be accessed within the data.
 * @param string $locale The name of the file.
 * @return string The full filename.
 */
function getFileName(string $folder, string $locale): string
{
    return realpath(dirname(__FILE__) . "/../assets/data/{$folder}") . "/{$locale}.json";
}

/**
 * Parse the global $argv to make sure we have the information that we need and
 * extract the proper config.
 * 
 * @param array $args The global arguments for this execution.
 * @param array $config Raw configuration.
 * @return array Settings for this execution.
 */
function parseArgs(array $args, array $config): array
{

    if (count($args) < 3) {
        die('ERROR: 2 arguments rquired: type, locale.' . PHP_EOL);
    }
    
    list($ignore, $type, $locale) = $args;
    
    if (!array_key_exists($type, $config)) {
    
        $keys = array_map(function ($key) {
            return "\"{$key}\"";
        }, array_keys($config));
    
        die('ERROR: $type must be in ' . implode(',', $keys) . ' - "' . $type . '" given.' . PHP_EOL);
    
    }
    
    $fileName = getFileName($config[$type]['folder'], $locale);
    
    if (!file_exists($fileName)) {
        die('ERROR: file "' . $fileName . '" does not exist.' . PHP_EOL);
    }

    return array_merge($config[$type], [
        'type' => $type,
        'locale' => $locale,
        'file' => $fileName,
    ]);

}

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
 * Writes the given JSON string to the file at the given location.
 * 
 * @param string $json Formatted JSON to write.
 * @param string $file Location of the file to write.
 */
function writeFile(string $json, string $file)
{

    $handler = fopen($file, 'w');
    fwrite($handler, $json);
    fclose($handler);

}

/**
 * Runs the entire process.
 */
function run()
{

    // Work out the setup based on the call's arguments.
    $config = [
        'roles' => [
            'folder' => 'characters',
            'data-map' => [
                'flavor' => null,
                'remindersGlobal' => function (string $cell) {
                    return array_map('trim', explode(',', $cell));
                },
                'reminders' => function (string $cell) {
                    return array_map('trim', explode(',', $cell));
                },
            ],
            'tab-map' => [
                'de_DE' => 'de_DE (official)',
            ],
        ],
        'jinxes' => [
            'folder' => 'jinxes',
            'data-map' => [
                '' => null,
            ],
        ],
    ];
    
    // Augment the raw configuration based on the .env files.
    $env = getLocalEnv();
    if (array_key_exists('ROLES_KEY', $env)) {
        $config['roles']['key'] = $env['ROLES_KEY'];
    }
    if (array_key_exists('JINXES_KEY', $env)) {
        $config['jinxes']['key'] = $env['JINXES_KEY'];
    }

    // Work out the settings based on the raw configuration and the arguments.
    $settings = parseArgs($GLOBALS['argv'], $config);
    
    // Check that we have a key for the spreadsheet.
    if (!array_key_exists('key', $settings) || empty($settings['key'])) {
        die('ERROR: config key not set for "' . $settings['type'] . '" type.' . PHP_EOL);
    }

    // Parse and process the data.    
    $contents = getContents(
        $settings['key'],
        ($settings['tab-map'] ?? [])[$settings['locale']] ?? $settings['locale'],
    );
    $csv = parseCSV($contents);
    $assoc = makeAssocArray($csv);
    $data = updateAssoc($assoc, $settings['data-map'] ?? []);
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    writeFile($json . PHP_EOL, $settings['file']);

}

echo 'Processing ...' . "\r";
$start = microtime(true);
run();
$duration = microtime(true) - $start;
echo 'Done in ' . $duration . 'ms' . PHP_EOL;
