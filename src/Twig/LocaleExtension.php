<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class LocaleExtension extends AbstractExtension
{

    public function getFunctions(): array
    {
        return [
            new TwigFunction('locales', [$this, 'getLocales'])
        ];
    }

    public function getLocales(): array
    {
        return [
            ['de_DE', 'Deutsch'],
            ['en_GB', 'English'],
            ['es_AR', 'Español argentino'],
            ['fr_FR', 'Français'],
            ['pt_BR', 'Português brasileiro'],
            ['ru_RU', 'Русский'],
            ['sv_SE', 'Svenska'],
            ['zh_CN', '简体中文'],
            ['zh_TW', '繁體中文'],
            ['he_IL', 'עִברִית']
        ];
    }

}
