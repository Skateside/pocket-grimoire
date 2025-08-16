<?php

namespace App\Model;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\Yaml\Yaml;

class GameModel extends YamlModel
{

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

    public function clamp(float $min, float $value, float $max): float
    {
        return max($min, min($value, $max));
    }

    public function sortGroups(array &$groups)
    {

        $order = [
            'townsfolk',
            'outsider',
            'minion',
            'demon',
            'traveller',
            'fabled'
        ];
        
        uksort($groups, function (string $keyA, string $keyB) use ($order) {
            return floor(
                $this->clamp(
                    0,
                    array_search($keyA, $order) - array_search($keyB, $order),
                    1
                )
            );
        });

    }

}
