<?php

namespace App\Model;

use App\Service\Storage;

/**
 * @phpstan-type StanLocale array{
 *  code: string,
 *  text: string,
 *  tpi: string,
 *  community: array{
 *      roles: string,
 *      jinxes: string,
 *  },
 * }
 */
class LocalesModel
{
    /**
     * @var StanLocale[]
     */
    protected array $locales;

    public function __construct(
        protected Storage $storage,
    ) {
        $this->locales = $storage->readYaml(Storage::LOCATION_CONFIG, 'locales.yaml');
    }

    /**
     * Exposes the locales.
     *
     * @template T
     * @param (callable(StanLocale): T)|null $map Optional map function to
     * convert the results before returning them.
     * @return ($map is null ? StanLocale[] : T[]) The locales, optionally
     * converted with the map function.
     */
    public function getLocales(?callable $map = null): array
    {
        if (is_callable($map)) {
            return array_map($map, $this->locales);
        }

        return $this->locales;
    }

    /**
     * Gets an array of TPI locales to Pocket Grimoire locales.
     *
     * @return array<string, string> TPI locales to Pocket Grimoire locales.
     */
    public function getTpiToCode(): array
    {
        $locales = [];

        foreach ($this->locales as $locale) {
            $locales[$locale['tpi']] = $locale['code'];
        }

        return $locales;
    }

    /**
     * Converts the given Pocket Grimoire code into the TPI code.
     *
     * @param string $code Pocket Grimoire locale code.
     * @return string TPI locale code.
     */
    public function codeToTpi(string $code): string
    {
        foreach ($this->locales as $locale) {
            if ($locale['code'] === $code) {
                return $locale['tpi'];
            }
        }

        return '';
    }

    /**
     * Converts the given TPI locale code into an array of matching Pocket
     * Grimoire codes. This is because the Pocket Grimoire has some granularity
     * that TPI currently doesn't.
     *
     * @param string $tpi TPI locale code.
     * @return string[] Pocket Grimoire locale codes.
     */
    public function tpiToCodes(string $tpi): array
    {
        $codes = [];

        foreach ($this->locales as $locale) {
            if ($locale['tpi'] === $tpi) {
                $codes[] = $locale['code'];
            }
        }

        return $codes;
    }
}
