<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
// use Symfony\Component\Console\Input\InputOption;
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

        $rawReminders = $this->storage->readJson('reminders.json', Storage::LOCATION_DATA);
        $reminders = $this->resourcesModel->filterReminders($rawReminders);

        if (count($rawReminders) !== count($reminders)) {
            $io->warning('Some reminders have been filtered out.');
        }

        $rawCharacters = $this->storage->readJson('characters.json', Storage::LOCATION_DATA);
        $characters = array_filter($rawCharacters, function ($item) {
            return $this->resourcesModel->isValidRoleEntry($item);
        });

        if (count($rawCharacters) !== count($characters)) {
            $io->warning('Some characters have been filtered out.');
        }

        $rawJinxes = $this->storage->readJson('jinxes.json', Storage::LOCATION_DATA);
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
            $results = $this->generateLocale(
                $tpiCode,
                $characters,
                $reminders,
                $jinxes,
                "{$pgCode}.json",
                $output->isVeryVerbose(),
            );

            $tableBody[] = [
                $tpiCode,
                (string) $results['fetch'],
                (string) $results['roles'],
                (string) $results['jinxes'],
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
                ['Locale', 'Fetch', 'Roles', 'Jinxes'],
                $tableBody,
            );
        }

        $io->success('Characters and Jinxes translations written');

        return Command::SUCCESS;
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
            'roles' => true,
            'jinxes' => true,
        ];
        $body = [];

        if ($raw['success']) {
            $body = $raw['body'];
        } else {
            $results['fetch'] = "Unable to fetch: {$raw['body']}";
        }

        $roles = $this->storage->writeJson(
            $filename,
            Storage::LOCATION_CHARACTERS,
            $this->model->combineRoles(
                $characters,
                $reminders,
                $body['roles'] ?? [],
                $body['reminders'] ?? [],
            ),
            $isPretty ? JSON_PRETTY_PRINT : 0,
        );

        if ($roles === false) {
            $results['roles'] = 'Failed to write';
        }

        $theJinxes = $this->storage->writeJson(
            $filename,
            Storage::LOCATION_JINXES,
            $this->model->combineJinxes(
                $jinxes,
                $body['jinxes'] ?? [],
            ),
            $isPretty ? JSON_PRETTY_PRINT : 0,
        );

        if ($theJinxes === false) {
            $results['jinxes'] = 'Failed to write';
        }

        return $results;
    }
}
