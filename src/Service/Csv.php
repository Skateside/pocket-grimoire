<?php

namespace App\Service;

class Csv
{
    public function parse(string $contents): array
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

    public function parseArray(string $contents): array
    {
        return $this->makeAssocArray($this->parse($contents));
    }

    protected function makeAssocArray(array $array): array
    {
        $headers = array_shift($array);

        return array_map(function (array $line) use ($headers) {
            return array_combine($headers, $line);
        }, $array);
    }
}
