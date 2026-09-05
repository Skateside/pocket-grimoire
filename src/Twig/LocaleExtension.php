<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use App\Model\LocalesModel;

class LocaleExtension extends AbstractExtension
{
    public function __construct(
        protected LocalesModel $localesModel,
    ) {}

    public function getFunctions(): array
    {
        return [
            new TwigFunction('locales', [$this, 'getLocales']),
        ];
    }

    /**
     * @return array<string[]>
     */
    public function getLocales(): array
    {
        return $this->localesModel->getLocales(function (array $locale) {
            return [$locale['code'], $locale['text']];
        });
    }
}
