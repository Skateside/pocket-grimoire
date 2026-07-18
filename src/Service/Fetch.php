<?php

namespace App\Service;

class Fetch
{
    /**
     * @var string Location of the TPI jinxes data.
     */
    const URL_TPI_JINXES = 'https://release.botc.app/resources/data/jinxes.json';
    
    /**
     * @var string Location of the TPI night sheet data.
     */
    const URL_TPI_NIGHTSHEET = 'https://release.botc.app/resources/data/nightsheet.json';
    
    /**
     * @var string Location of the TPI roles data.
     */
    const URL_TPI_ROLES = 'https://release.botc.app/resources/data/roles.json';

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $source Source of the contents to get and parse.
     * @return array Results of parsing the contents (if possible).
     */
    public function getJson(string $source): array
    {
        $contents = file_get_contents($source);

        if ($contents === false) {
            return $this->failure("'{$source}' not found");
        }

        if (!json_validate($contents)) {
            return $this->failure("'{$source}' not valid JSON");
        }

        $decoded = json_decode($contents, true);

        if (!is_array($decoded)) {
            return $this->failure('JSON not an array');
        }

        return $this->success($decoded);
    }

    /**
     * Returns a success.
     *
     * @param mixed $data Body for the success response.
     * @return array Success response.
     */
    protected function success(mixed $data): array
    {
        return ['success' => true, 'body' => $data];
    }

    /**
     * Returns a failure.
     *
     * @param mixed $data Body for the failure response.
     * @return array Failure response.
     */
    protected function failure(mixed $data): array
    {
        return ['success' => false, 'body' => $data];
    }
}
