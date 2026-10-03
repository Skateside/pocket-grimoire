<?php

namespace App\Service;

class Csv
{
    /**
     * Parses a string as if it's a CSV.
     *
     * @param string $contents String to parse.
     * @return array<string[]> Parsed data.
     */
    public function parse(string $contents): array
    {
        $temp = tmpfile();
        fwrite($temp, $contents);
        fseek($temp, 0);

        $data = [];
        while (($line = fgetcsv($temp, escape: '\\')) !== false) {
            $data[] = $line;
        }

        fclose($temp);

        return $data;
    }

    /**
     * Parses a string as if it's a CSV and returns an associative array.
     *
     * @param string $contents String to parse.
     * @param array<string, string> $map Map for converting headers.
     * @return array<array<string, string>> Parsed data.
     */
    public function parseArray(string $contents, array $map = []): array
    {
        return $this->makeAssocArray($this->parse($contents), $map);
    }

    /**
     * Converts the give parsed CSV data into an associative array by assuming
     * that the first row contains headers.
     *
     * @param array<string[]> $array Parsed CSV data.
     * @param array<string, string> $map Map for converting headers.
     * @return array<array<string, string>> Associative array.
     */
    protected function makeAssocArray(array $array, array $map = []): array
    {
        $headers = array_shift($array);
        $headers = array_map(function ($header) use ($map) {
            return $map[$header] ?? $header;
        }, $headers ?? []);

        return array_map(function (array $line) use ($headers) {
            return array_combine($headers, $line);
        }, $array);
    }
}
