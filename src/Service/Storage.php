<?php

namespace App\Service;

class Storage
{
    const LOCATION_COMPILED = 'compiled';
    const LOCATION_RAW = 'raw';

    protected $locations = [];

    public function __construct()
    {
        /*
        $this->locations = [
            static::LOCATION_COMPILED => '/assets/data/compiled',
            static::LOCATION_RAW => '/assets/data/raw',
        ];
        /*/
        $this->locations = [
            static::LOCATION_COMPILED => '/ideas/data/compiled',
            static::LOCATION_RAW => '/ideas/data/raw',
        ];
        //*/
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
        $realpath = realpath(dirname(__FILE__) . '/../..' . $path);
        return $realpath;
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
        $path = $this->getRealpath($locationId) . '/' . $filename;

        return file_get_contents($path);
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
        $path = $this->getRealpath($locationId) . '/' . $filename;

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
        $path = $this->getRealpath($locationId) . '/' . $filename;

        return file_exists($path);
    }
}
