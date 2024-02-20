<?php

namespace App\Model;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\Yaml\Yaml;

abstract class YamlModel
{

    private $fileLocator;
    private $fileName;
    private $data;

    public function __construct(string $configDir, string $fileName)
    {

        $this->fileLocator = new FileLocator($configDir);
        $this->fileName = $fileName;

    }

    protected function getData(): array
    {

        if (is_null($this->data)) {

            $file = $this->fileLocator->locate($this->fileName);
            $this->data = Yaml::parse(file_get_contents($file));

        }

        return $this->data;

    }

}

