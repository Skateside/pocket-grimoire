<?php

namespace App\Service;

class Storage
{
    const LOCATION_COMPILED = 'compiled';
    const LOCATION_RAW = 'raw';

    protected $projectDir;
    protected $locations = [];

    public function __construct(string $projectDir)
    {
        $this->projectDir = $projectDir;
        $this->locations = [
            static::LOCATION_COMPILED => '/assets/data/compiled',
            static::LOCATION_RAW => '/assets/data/raw',
        ];

        foreach ($this->locations as $id => $path) {
            $this->locations[$id] = implode(DIRECTORY_SEPARATOR, explode('/', $path));
        }
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
        return $this->getRealpath($id) . DIRECTORY_SEPARATOR . $filename;
    }

    /**
     * Reads the contents of the file at the given location.
     *
     * @param string $filename Name of the file to read.
     * @param string $locationId ID of the location where the file is located.
     * @return string|false The contents of the file or false on an error.
     */
    public function read(string $filename, string $locationId): mixed
    {
        return file_get_contents($this->getFilename($locationId, $filename));
    }

    /**
     * Reads the contents of the file at the given location as JSON.
     *
     * @param string $filename Name of the file to read.
     * @param string $locationId ID of the location where the file is located.
     * @return mixed JSON data.
     */
    public function readJson(string $filename, string $locationId): mixed
    {
        return json_decode($this->read($filename, $locationId), true);
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
     * @param string $filename Name of the file to write.
     * @param string $locationId ID of the location to write to.
     * @param string $data Contents of the file to write.
     * @param int $flags Optional flags.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function write(
        string $filename,
        string $locationId,
        string $data,
        int $flags = 0,
    ): mixed {
        if ($this->mkdir($locationId, 0775) === false) {
            throw new \Exception("Can't create '{$locationId}' directory");
        }

        $path = $this->getFilename($locationId, $filename);

        return file_put_contents($path, $data, $flags);
    }

    /**
     * Helper function for writing JSON to a file.
     *
     * @param string $filename Name of the file to write.
     * @param string $locationId ID of the location to write to.
     * @param mixed $data JSON to encode and write.
     * @param int $jsonFlags Optional flags for writing JSON.
     * @param int $flags Optional flags for writing the file.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function writeJson(
        string $filename,
        string $locationId,
        mixed $data,
        int $jsonFlags = 0,
        int $flags = 0,
    ): mixed {
        return $this->write($filename, $locationId, json_encode($data, $jsonFlags), $flags);
    }

    /**
     * Checks to see if the given file exists.
     *
     * @param string $filename Name of the file.
     * @param string $locationId ID of the location of the file.
     * @return bool true if the file exists, false if it doesn't.
     */
    public function exists(string $filename, string $locationId): bool
    {
        return file_exists($this->getFilename($locationId, $filename));
    }
}
