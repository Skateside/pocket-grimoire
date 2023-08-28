<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use App\Model\LocaleModel;

class LocaleExtension extends AbstractExtension
{

    private $model;

    public function __construct(LocaleModel $model)
    {
        $this->model = $model;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('locales', [$this, 'getLocales'])
        ];
    }

    public function getLocales(): array
    {
        return $this->model->getLocalesArray();
        // return [
        //     ['de_DE', 'Deutsch'],
        //     ['en_GB', 'English'],
        //     ['es_AR', 'Español argentino'],
        //     ['fr_FR', 'Français'],
        //     ['nb_NO', 'Norsk bokmål'],
        //     ['nn_NO', 'Norsk nynorsk'],
        //     ['pt_BR', 'Português brasileiro'],
        //     ['ru_RU', 'Русский'],
        //     ['sv_SE', 'Svenska'],
        //     ['vi_VI', 'Tiếng việt'],
        //     ['ja_JP', '日本語'],
        //     ['zh_CN', '简体中文'],
        //     ['zh_TW', '繁體中文'],
        //     ['he_IL', 'עִברִית']
        // ];
    }

}
