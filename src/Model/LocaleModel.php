<?php

namespace App\Model;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\Yaml\Yaml;

class LocaleModel extends YamlModel
{

    public function getLocales(array $exclude = []): array
    {
        return array_filter($this->getData(), function ($item) use ($exclude) {
            return !in_array($item['code'], $exclude);
        });
    }

    public function getLocalesArray(array $exclude = []): array
    {
        return array_map(function ($item) {
            return [$item['code'], $item['text']];
        }, $this->getLocales($exclude));
    }

    public function getLocaleCodes(array $exclude = []): array
    {
        return array_map(function ($item) {
            return $item['code'];
        }, $this->getLocales($exclude));
    }

}
