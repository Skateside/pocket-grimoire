<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class HashExtension extends AbstractExtension
{

    public function getFunctions(): array
    {
        return [
            new TwigFunction('hash', [$this, 'generateHash'])
        ];
    }

    public function generateHash(int $length = 16): string
    {
        return bin2hex(random_bytes($length));
    }

}
