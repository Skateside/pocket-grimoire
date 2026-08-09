<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Enums\TPIURLEnum;
use App\Model\LocaleModel;
use App\Model\TPIResourcesModel;
use App\Model\TPITranslationModel;
use App\Service\Fetch;
use App\Service\Storage;

class TranslateResourcesCommand extends Command
{
    protected static $defaultName = 'pocket-grimoire:translate';
    protected $model;
    protected $localeModel;
    protected $resourcesModel;
    protected $fetch;
    protected $storage;

    public function __construct(
        TPITranslationModel $model,
        LocaleModel $localeModel,
        TPIResourcesModel $resourcedModel,
        Fetch $fetch,
        Storage $storage,
    ) {
        $this->model = $model;
        $this->localeModel = $localeModel;
        $this->resourcesModel = $resourcedModel;
        $this->fetch = $fetch;
        $this->storage = $storage;

        return parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($output->isVerbose()) {
            $io->title('Translating resources');
            $io->section('Reading local files');
        }

        $locales = [];
        foreach ($this->localeModel->getLocaleCodes() as $code) {
            $locales[$this->model->asTPILocale($code)] = $code;
        }

        $rawReminders = $this->storage->readJson(Storage::LOCATION_RAW, 'reminders.json');
        $reminders = $this->resourcesModel->filterReminders($rawReminders);

        if (count($rawReminders) !== count($reminders)) {
            $io->warning('Some reminders have been filtered out.');
        }

        $rawCharacters = $this->storage->readJson(Storage::LOCATION_RAW, 'characters.json');
        $characters = array_filter($rawCharacters, function ($item) {
            return $this->resourcesModel->isValidRoleEntry($item);
        });

        if (count($rawCharacters) !== count($characters)) {
            $io->warning('Some characters have been filtered out.');
        }

        $rawJinxes = $this->storage->readJson(Storage::LOCATION_RAW, 'jinxes.json');
        $jinxes = $this->resourcesModel->filterJinxes($rawJinxes);

        if (count($rawJinxes) !== count($jinxes)) {
            $io->warning('Some jinxes have been filtered out.');
        }

        if ($output->isVerbose()) {
            $io->writeln('Done');
            $io->section('Downloading translations and writing files');
        }

        $bar = null; // Created in verbose mode.
        $tableBody = [];

        if ($output->isVerbose()) {
            $bar = $io->createProgressBar(count($locales));
            $bar->start();
        }

        foreach ($locales as $tpiCode => $pgCode) {
            $augmented = $this->augmentData($pgCode, $characters, $jinxes);
            $results = $this->generateLocale(
                $tpiCode,
                $augmented['characters'],
                $reminders,
                $augmented['jinxes'],
                "{$pgCode}.js",
                $output->isVeryVerbose(),
            );

            $tableBody[] = [
                $pgCode,
                $tpiCode,
                (string) $results['fetch'],
                implode(' ', $augmented['notes']),
                (string) $results['write'],
            ];

            if ($output->isVerbose()) {
                $bar->advance();
            }
        }

        if ($output->isVerbose()) {
            $bar->finish();
            $io->writeln('');
            $io->section('Results');
            $io->table(
                ['Locale', 'TPI Locale', 'Fetch', 'Augment', 'Write'],
                $tableBody,
            );
        }

        $io->success('Translations written');

        return Command::SUCCESS;
    }

    /**
     * Augments the given characers and jinxes with locale-specific data, if it
     * exists.
     *
     * @param string $locale Locale (in the format lc_CC) to check.
     * @param array<array<mixed>> $characters Base characters.
     * @param array<array<mixed>> $jinxes Base jinxes.
     * @return array<string, array<array<mixed>>> Augmented data.
     */
    protected function augmentData(
        string $locale,
        array $characters,
        array $jinxes,
    ): array {
        $augmented = [
            'characters' => $characters,
            'jinxes' => $jinxes,
            'notes' => [],
        ];

        if (!$this->storage->exists(Storage::LOCATION_RAW, $locale)) {
            return $augmented;
        }

        if ($this->storage->exists(Storage::LOCATION_RAW, $locale, 'characters.json')) {
            $rawLocaleCharacters = $this->storage->readJson(Storage::LOCATION_RAW, $locale, 'characters.json');
            $localeCharacters = array_filter($rawLocaleCharacters, function ($item) {
                return $this->resourcesModel->isValidRoleEntry($item);
            });
            $augmented['characters'] = array_merge($augmented['characters'], $localeCharacters);

            $countRaw = count($rawLocaleCharacters);
            $count = count($localeCharacters);
            $augmented['notes'][] = "{$count}/{$countRaw} character(s) added.";
        }
        
        if ($this->storage->exists(Storage::LOCATION_RAW, $locale, 'jinxes.json')) {
            $rawLocaleJinxes = $this->storage->readJson(Storage::LOCATION_RAW, $locale, 'jinxes.json');
            $localeJinxes = $this->resourcesModel->filterJinxes($rawLocaleJinxes);
            $augmented['jinxes'] = array_merge($augmented['jinxes'], $localeJinxes);

            $countRaw = count($rawLocaleJinxes);
            $count = count($localeJinxes);
            $augmented['notes'][] = "{$count}/{$countRaw} jinxes(s) added.";
        }

        return $augmented;
    }

    /**
     * Generates the translated locale.
     *
     * @param string $locale TPI locale for the translations.
     * @param array $characters Base character data.
     * @param array $reminders Base reminder translations.
     * @param array $jinxes Base jinx translations.
     * @param string $filename Name of the file to generate.
     * @param bool $isPretty If true, the generated file will be formatted.
     * @return string|true Either true on success or a string with an error on failure.
     */
    protected function generateLocale(
        string $locale,
        array $characters,
        array $reminders,
        array $jinxes,
        string $filename,
        bool $isPretty = false,
    ): mixed {
        $raw = $this->fetch->getJson(sprintf(TPIURLEnum::GAME, $locale));
        $results = [
            'fetch' => true,
            'write' => true,
        ];
        $body = [];

        if ($raw['success']) {
            $body = $raw['body'];
        } else {
            $results['fetch'] = $raw['body'];
        }

        $data = [
            'roles' => $this->model->combineRoles(
                $characters,
                $reminders,
                $body['roles'] ?? [],
                $body['reminders'] ?? [],
            ),
            'jinxes' => $this->model->combineJinxes(
                $jinxes,
                $body['jinxes'] ?? [],
            ),
            'game' => $this->storage->readYaml(Storage::LOCATION_CONFIG, 'game.yaml'),
            'scripts' => $this->storage->readYaml(Storage::LOCATION_CONFIG, 'scripts.yaml'),
        ];
        $contents = 'var PG = ' . json_encode(
            $data,
            $isPretty ? JSON_PRETTY_PRINT : 0,
        ) . ';';
        $file = $this->storage->write(
            Storage::LOCATION_COMPILED,
            $filename,
            $contents,
        );

        if ($file === false) {
            $results['write'] = 'Failed to write';
        }

        return $results;
    }
}
