<?php

namespace App\Model;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\Yaml\Yaml;

class GameModel
{

    private $fileLocator;

    public function __construct(string $configDir)
    {
        $this->fileLocator = new FileLocator($configDir);
    }

    public function getData(): array
    {
        $file = $this->fileLocator->locate('game.yaml');
        return Yaml::parse(file_get_contents($file));
    }

    public function getFeed(): array
    {
        return array_map(function ($item) {
            return $item['breakdown'];
        }, $this->getData());
    }

    public function getTransposedFeed(): array
    {

        $transposed = [];

        foreach ($this->getData() as $count) {

            if (!array_key_exists('players', $transposed)) {
                $transposed['players'] = [];
            }

            $column = count($transposed['players']);
            $transposed['players'][$column] = $count['players'];

            foreach ($count['breakdown'] as $type => $breakdown) {

                if (!array_key_exists($type, $transposed)) {
                    $transposed[$type] = [];
                }

                $transposed[$type][$column] = $breakdown;
            }

        }

        return $transposed;

    }

}
