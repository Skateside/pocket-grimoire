<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
// use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use App\Dto\{
    DtoInterface,
    JinxesDto,
    TPIRemindersExpandedDto,
    TPIRolesExpandedDto,
};
// use App\Enums\{
//     CommunityTranslationEnum,
//     TPIURLEnum,
// };
use App\Model\{
    LocalesModel,
//     TPIResourcesModel,
//     TPITranslationModel,
};
use App\Service\{
    Fetch,
    Storage,
};

#[AsCommand(name: 'pocket-grimoire:translate')]
class TranslateResourcesCommand extends Command
{
    // protected TPITranslationModel $translationModel;
    protected LocalesModel $localesModel;
    // protected TPIResourcesModel $resourcesModel;
    protected Fetch $fetch;
    protected Storage $storage;
    // protected TranslatorInterface $translator;
    protected ValidatorInterface $validator;

    public function __construct(
        // TPITranslationModel $translationModel,
        LocalesModel $localesModel,
        // TPIResourcesModel $resourcesModel,
        Fetch $fetch,
        Storage $storage,
        // TranslatorInterface $translator,
        ValidatorInterface $validator,
    ) {
        // $this->translationModel = $translationModel;
        $this->localesModel = $localesModel;
        // $this->resourcesModel = $resourcesModel;
        $this->fetch = $fetch;
        $this->storage = $storage;
        // $this->translator = $translator;
        $this->validator = $validator;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($output->isVerbose()) {
            $io->title('Translating resources');
            $io->section('Reading local files');
        }

        $characters = $this->getLocalJson('characters.json', TPIRolesExpandedDto::class);
        $reminders = $this->getLocalJson('reminders.json', TPIRemindersExpandedDto::class);
        $jinxes = $this->getLocalJson('jinxes.json', JinxesDto::class);

        if (
            !is_null($characters['error'])
            || !is_null($reminders['error'])
            || !is_null($jinxes['error'])
        ) {
            $io->error($characters['error'] ?? $reminders['error'] ?? $jinxes['error']);
            return Command::FAILURE;
        }

        $locales = $this->localesModel->getLocales();
        $bar = null; // Created in verbose mode.

        if ($output->isVerbose()) {
            $io->writeln('Done');
            $io->section('Downloading translations and writing files');
            $bar = $io->createProgressBar(count($locales));
            $bar->start();
        }

        foreach ($locales as $locale) {
            // TODO: Get the official remote JSON translations.
            // TODO: Get the community JSON translations.

            if ($output->isVerbose()) {
                $bar->advance();
            }
        }

        return Command::SUCCESS;
        /*
        $locales = $this->localesModel->getTpiToCode();

        $rawReminders = $this->storage->readJson(Storage::LOCATION_RAW, 'reminders.json');
        $reminders = $this->translationModel->filterReminders($rawReminders);

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

            $raw = $this->fetch->getJson(sprintf(TPIURLEnum::GAME->value, $tpiCode));
            $error = $this->fetch->getLastError($this->translator);

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

            foreach ($this->localesModel->tpiToCodes($tpiCode) as $locale) {
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
         */
    }

    /**
     * Reads the JSON from the given file name and passes it into the given DTO,
     * allowing it to be validated.
     *
     * @param string $filename Name of the file to parse.
     * @param (callable(array<mixed>): DtoInterface)|string $dtoClass Class string for the DTO class.
     * @return array{dto: ?DtoInterface, error: ?string, violations: array<string, string[]>}
     * Results of the JSON being parsed and validated.
     */
    protected function getLocalJson(
        string $filename,
        callable|string $dtoClass,
    ): array {
        $response = [
            'dto' => null,
            'error' => null,
            'violations' => [],
        ];

        $data = $this->storage->readJson(Storage::LOCATION_RAW, $filename);

        if (is_null($data)) {
            $response['error'] = 'Cannot read JSON';
            return $response;
        }

        $response['dto'] = is_callable($dtoClass) ? $dtoClass($data) : $dtoClass::from($data);
        $violations = $this->validator->validate($response['dto']);

        if (count($violations)) {
            $response['violations'] = $this->convertViolations($violations);
        }

        return $response;
    }

    /**
     * Converts the violations into a more human-readable format.
     *
     * @param ConstraintViolationListInterface $violations Violations that
     * should be logged.
     * @return array<string, string[]> Human-readable violations.
     */
    protected function convertViolations(ConstraintViolationListInterface $violations): array
    {
        $converted = [];

        foreach ($violations as $violation) {
            $converted[$violation->getPropertyPath()][] = (string) $violation->getMessage();
        }

        return $converted;
    }

    /**
     * Fetches the local files, parses and filters them.
     *
     * @return array{
     *  reminders: array<string, array{text: string, examples: string[]}>,
     *  characters: array<mixed>,
     *  jinxes: array<mixed>,
     *  count: array{reminders: int, characters: int, jinxes: int},
     * }
     */
    /*
    protected function fetchLocalData(): array
    {
        $rawReminders = $this->storage->readJson(Storage::LOCATION_RAW, 'reminders.json');
        $reminders = $this->translationModel->filterReminders($rawReminders);

        $rawCharacters = $this->storage->readJson(Storage::LOCATION_RAW, 'characters.json');
        $characters = array_filter($rawCharacters, function ($item) {
            return $this->resourcesModel->isValidRoleEntry($item);
        });

        $rawJinxes = $this->storage->readJson(Storage::LOCATION_RAW, 'jinxes.json');
        $jinxes = $this->resourcesModel->filterJinxes($rawJinxes);

        return [
            'reminders' => $reminders,
            'characters' => $characters,
            'jinxes' => $jinxes,
            'counts' => [
                'reminders' => count($rawReminders),
                'characters' => count($rawCharacters),
                'jinxes' => count($rawJinxes),
            ],
        ];
    }
     */

    /**
     * Augments the given characers and jinxes with locale-specific data, if it
     * exists.
     *
     * @param string $locale Locale (in the format lc_CC) to check.
     * @param array<array<mixed>> $characters Base characters.
     * @param array<array<mixed>> $jinxes Base jinxes.
     * @return array<string, array<array<mixed>>> Augmented data.
     */
    /*
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
     */

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
    /*
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
            'roles' => $this->translationModel->combineRoles(
                $characters,
                $reminders,
                $translations['roles'] ?? [],
                $translations['reminders'] ?? [],
            ),
            'jinxes' => $this->translationModel->combineJinxes(
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
     */
}
