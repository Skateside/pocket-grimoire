<?php

namespace App\Service;

use Symfony\Component\Yaml\Yaml;

class Storage
{
    const LOCATION_CONFIG = 'config';
    const LOCATION_COMPILED = 'compiled';
    const LOCATION_RAW = 'raw';
    const LOCATION_PUBLIC_JS = 'public_js';
    const LOCATION_TOOLS = 'tools';

    protected $projectDir;
    protected $locations = [];

    public function __construct(string $projectDir)
    {
        $this->projectDir = $projectDir;
        $this->locations = [
            static::LOCATION_CONFIG => '/config',
            static::LOCATION_COMPILED => '/assets/data/compiled',
            static::LOCATION_RAW => '/assets/data/raw',
            static::LOCATION_PUBLIC_JS => '/public/build/js',
            static::LOCATION_TOOLS => '/tools',
        ];

        foreach ($this->locations as $id => $path) {
            $this->locations[$id] = implode(DIRECTORY_SEPARATOR, explode('/', $path));
        }
    }

    /**
     * Helper function for concatenating directory paths.
     *
     * @param string ...$parts Parts to concatenate together.
     * @return string Concatenated path.
     */
    public static function concat(string ...$parts): string
    {
        return implode(DIRECTORY_SEPARATOR, $parts);
    }

    /**
     * Gets the real path of the location requested.
     *
     * @param string $id ID of the location to access.
     * @return string Real path.
     */
    public function getRealpath(string $id): string
    {
        if (!array_key_exists($id, $this->locations)) {
            throw new \Exception("Can't find '{$id}' location", E_USER_ERROR);
        }

        $path = $this->locations[$id];
        $realpath = $this->projectDir . $path;

        return $realpath;
    }

    /**
     * Helper function for getting the full file name for the file in the given
     * location.
     *
     * @param string $id ID of the location.
     * @param string $filename Filename.
     * @return string Full file name.
     */
    public function getFilename(string $id, string $filename): string
    {
        return static::concat($this->getRealpath($id), $filename);
    }

    /**
     * Reads the contents of the file at the given location.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Directories/filename to read.
     * @return string|false The contents of the file or false on an error.
     */
    public function read(string $locationId, string ...$parts): string
    {
        return file_get_contents(static::concat($this->getRealpath($locationId), ...$parts));
    }

    /**
     * Reads the contents of the file at the given location as JSON.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Directories/filename to read.
     * @return mixed JSON data.
     */
    public function readJson(string $locationId, string ...$parts): array
    {
        return json_decode($this->read($locationId, ...$parts), true);
    }

    /**
     * Reads the contents of the file at the given location as YAML.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Directories/filename to read.
     * @return mixed YAML data.
     */
    public function readYaml(string $locationId, string ...$parts): array
    {
        return Yaml::parse($this->read($locationId, ...$parts));
    }

    /**
     * Makes the directory at the given location ID. Optionally, the directory
     * permissions can be set.
     *
     * @param string $locationId ID of the location to create.
     * @param int $permissions Permissions for the directory.
     * @return bool true if the directory was created (or already exists),
     *         false on an error.
     */ 
    public function mkdir(string $locationId, int $permissions = 0664): bool
    {
        $fullPath = $this->getRealpath($locationId);
        $done = true;

        if (!is_dir($fullPath)) {
            $done = mkdir($fullPath, $permissions, true);
        }

        return $done;
    }

    /**
     * Wrapper for file_put_contents()
     *
     * @param string $locationId ID of the location to write to.
     * @param string $filename Name of the file to write.
     * @param string $data Contents of the file to write.
     * @param int $flags Optional flags.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function write(
        string $locationId,
        string $filename,
        string $data,
        int $flags = 0
    ): int {
        if ($this->mkdir($locationId, 0775) === false) {
            throw new \Exception("Can't create '{$locationId}' directory");
        }

        $path = $this->getFilename($locationId, $filename);

        return file_put_contents($path, $data, $flags);
    }

    /**
     * Helper function for writing JSON to a file.
     *
     * @param string $locationId ID of the location to write to.
     * @param string $filename Name of the file to write.
     * @param mixed $data JSON to encode and write.
     * @param int $jsonFlags Optional flags for writing JSON.
     * @param int $flags Optional flags for writing the file.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function writeJson(
        string $locationId,
        string $filename,
        mixed $data,
        int $jsonFlags = 0,
        int $flags = 0
    ): int {
        return $this->write($locationId, $filename, json_encode($data, $jsonFlags), $flags);
    }

    /**
     * Checks to see if the given directory/file exists.
     *
     * @param string $locationId ID of the location of the file.
     * @param string ...$parts Directories and/or filename(s) to check for.
     * @return bool true if the file exists, false if it doesn't.
     */
    public function exists(string $locationId, string ...$parts): bool
    {
        return file_exists(static::concat($this->getRealpath($locationId), ...$parts));
    }
}
