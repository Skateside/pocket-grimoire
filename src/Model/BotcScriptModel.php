<?php

namespace App\Model;

class BotcScriptModel
{
    /**
     * @var int MAX_RESULTS Maximum number of results to return.
     */
    const MAX_RESULTS = 10;

    /**
     * @param ?array{results?: array<mixed>} $json Either the data to
     *        convert or null.
     * @return array{success: bool, body: array<string, string>[]|string}
     *         Converted results.
     */
    public function convert(?array $json): array
    {
        $response = [
            'success' => true,
            'body' => [],
        ];

        if (
            !is_array($json)
            || !array_key_exists('results', $json)
            || count($json['results']) === 0
        ) {

            return [
                'success' => false,
                'body' => 'error.no_results',
            ];

        }

        $results = $json['results'];
        usort($results, function ($a, $b) {
            if (array_key_exists('name', $a) && array_key_exists('name', $b)) {
                return $a['name'] <=> $b['name'];
            }

            return 0;
        });

        foreach ($results as $result) {
            if (count($response['body']) >= static::MAX_RESULTS) {
                break;
            }

            $response['body'][] = [
                'id' => $result['script_id'] ?? '',
                'author' => $result['author'] ?? '',
                'name' => $result['name'] ?? '',
                'script' => $result['content'] ?? '',
                'version' => $result['version'] ?? '',
                'type' => strtolower($result['script_type'] ?? ''),
            ];
        }

        return $response;
    }
}

