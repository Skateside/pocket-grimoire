<?php

namespace App\Model;

class LocaleModel extends YamlModel
{
    /**
     * Gets the locales, optionally excluding the ones mentioned.
     *
     * @param array $exclude Optional locales to exclude.
     * @return array Locales.
     */
    public function getLocales(array $exclude = []): array
    {
        return array_filter($this->getData(), function ($item) use ($exclude) {
            return !in_array($item['code'], $exclude);
        });
    }

    /**
     * Gets the locales and their names, optionally excluding the ones
     * mentioned.
     *
     * @param array $exclude Optional locales to exclude.
     * @return array Locales and names.
     */
    public function getLocalesArray(array $exclude = []): array
    {
        return array_map(function ($item) {
            return [$item['code'], $item['text']];
        }, $this->getLocales($exclude));
    }

    /**
     * Gets the locale codes, optionally excluding the ones mentioned.
     *
     * @param array $exclude Optional locales to exclude.
     * @return array Locale codes.
     */
    public function getLocaleCodes(array $exclude = []): array
    {
        return array_map(function ($item) {
            return $item['code'];
        }, $this->getLocales($exclude));
    }

}
