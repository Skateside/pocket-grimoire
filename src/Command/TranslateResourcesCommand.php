<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\Translation\TranslatorInterface;
use App\Enums\TPIURLEnum;
use App\Model\LocaleModel;
use App\Model\TPIResourcesModel;
use App\Model\TPITranslationModel;
use App\Service\Fetch;
use App\Service\Storage;

#[AsCommand(name: 'pocket-grimoire:translate')]
class TranslateResourcesCommand extends Command
{
    protected $model;
    protected $localeModel;
    protected $resourcesModel;
    protected $fetch;
    protected $storage;
    protected $translate;

    public function __construct(
        TPITranslationModel $model,
        LocaleModel $localeModel,
        TPIResourcesModel $resourcedModel,
        Fetch $fetch,
        Storage $storage,
        TranslatorInterface $translate,
    ) {
        $this->model = $model;
        $this->localeModel = $localeModel;
        $this->resourcesModel = $resourcedModel;
        $this->fetch = $fetch;
        $this->storage = $storage;
        $this->translate = $translate;

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

        $game = $this->storage->readYaml(Storage::LOCATION_CONFIG, 'game.yaml');
        $scripts = $this->storage->readYaml(Storage::LOCATION_CONFIG, 'scripts.yaml');

        foreach ($locales as $tpiCode => $pgCode) {
            $index = count($tableBody);
            $tableBody[$index] = [
                'locale' => $pgCode,
                'tpi_locale' => $tpiCode,
                'fetch' => '',
                'augment' => '',
                'write' => '',
            ];

            if ($output->isVerbose()) {
                $bar->advance();
            }

            $raw = $this->fetch->getJson(sprintf(TPIURLEnum::GAME, $tpiCode));
            $error = $this->fetch->getLastError($this->translate);

            if (empty($error)) {
                $tableBody[$index]['fetch'] = 'Done';
            } else {
                $tableBody[$index]['fetch'] = $error;
                continue;
            }

            $augmented = $this->augmentData($pgCode, $characters, $jinxes);

            if (count($augmented['notes'])) {
                $tableBody[$index]['augment'] = implode(' ', $augmented['notes']);
            }

            $contents = $this->createContents(
                $augmented['characters'],
                $reminders,
                $augmented['jinxes'],
                $raw,
                $game,
                $scripts,
                $output->isVeryVerbose(),
            );
            $files = [];

            foreach ($this->model->asPGLocales($tpiCode, $pgCode) as $locale) {
                $filename = "{$locale}.js";
                $written = $this->storage->write(
                    Storage::LOCATION_COMPILED,
                    $filename,
                    $contents,
                );

                if ($written !== false) {
                    $files[] = $filename;
                }
            }

            $tableBody[$index]['write'] = implode(', ', $files);
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
        array $jinxes
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
     * Creates the contents that will be written to the file.
     *
     * @param array $characters Base character data.
     * @param array $reminders Base reminder translations.
     * @param array $jinxes Base jinx translations.
     * @param array $translations Translations for the data. 
     * @param array $game Role type breakdown per number of players.
     * @param array $scripts Roles that are in each official script.
     * @param bool $isPretty If true, the generated file will be formatted.
     * @return string Contents to be written.
     */
    protected function createContents(
        array $characters,
        array $reminders,
        array $jinxes,
        array $translations,
        array $game,
        array $scripts,
        bool $isPretty = false,
    ): string {
        $data = [
            'roles' => $this->model->combineRoles(
                $characters,
                $reminders,
                $translations['roles'] ?? [],
                $translations['reminders'] ?? [],
            ),
            'jinxes' => $this->model->combineJinxes(
                $jinxes,
                $translations['jinxes'] ?? [],
            ),
            'game' => $game,
            'scripts' => $scripts,
        ];
        $contents = 'var PG = ' . json_encode(
            $data,
            $isPretty ? JSON_PRETTY_PRINT : 0,
        ) . ';';

        return $contents;
    }
}
