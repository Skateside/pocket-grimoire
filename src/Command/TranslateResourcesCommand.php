<?php

namespace App\Command;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\{
    DenormalizerInterface,
    NormalizerInterface,
};
// use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use App\Dto\{
    CommunityJinxDto,
    CommunityJinxesDto,
    CommunityRoleDto,
    CommunityRolesDto,
    // DtoInterface,
    GameDto,
    GamesDto,
    JinxDto,
    JinxesDto,
    ScriptDto,
    ScriptsDto,
    TPIReminderDto,
    TPIRemindersDto,
    TPIReminderExpandedDto,
    TPIRemindersExpandedDto,
    TPIRoleExpandedDto,
    TPIRolesExpandedDto,
    TranslationJinxDto,
    TranslationJinxesDto,
    TranslationRoleDto,
    TranslationRolesDto,
};
use App\Enums\{
    CommunityTranslationEnum,
    TPIURLEnum,
};
use App\Model\{
    LocalesModel,
//     TPIResourcesModel,
    TPITranslationModel,
};
use App\Service\{
    Csv,
    DataValidator,
    Fetch,
    Misc,
    Storage,
};

/**
 * @phpstan-import-type Data from TPIRolesExpandedDto as RolesArray
 * @phpstan-import-type Data from JinxesDto as JinxesArray
 * @phpstan-import-type Data from GamesDto as GamesArray
 * @phpstan-import-type Data from ScriptsDto as ScriptsArray
 */
#[AsCommand(name: 'pocket-grimoire:translate')]
class TranslateResourcesCommand extends Command
{
    protected TPITranslationModel $translationModel;
    protected LocalesModel $localesModel;
    // protected TPIResourcesModel $resourcesModel;
    protected Csv $csv;
    protected DataValidator $dataValidator;
    protected Fetch $fetch;
    protected Misc $misc;
    protected Storage $storage;
    // protected TranslatorInterface $translator;
    protected ValidatorInterface $validator;
    protected SerializerInterface $serializer;
    protected DenormalizerInterface&NormalizerInterface $normalizer;

    public function __construct(
        TPITranslationModel $translationModel,
        LocalesModel $localesModel,
        // TPIResourcesModel $resourcesModel,
        Csv $csv,
        DataValidator $dataValidator,
        Fetch $fetch,
        Misc $misc,
        Storage $storage,
        // TranslatorInterface $translator,
        ValidatorInterface $validator,
        SerializerInterface $serializer,
        DenormalizerInterface&NormalizerInterface $normalizer,
    ) {
        $this->translationModel = $translationModel;
        $this->localesModel = $localesModel;
        // $this->resourcesModel = $resourcesModel;
        $this->csv = $csv;
        $this->dataValidator = $dataValidator;
        $this->fetch = $fetch;
        $this->misc = $misc;
        $this->storage = $storage;
        // $this->translator = $translator;
        $this->validator = $validator;
        $this->serializer = $serializer;
        $this->normalizer = $normalizer;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($output->isVerbose()) {
            $io->title('Translating resources');
            $io->section('Reading local files');
        }

        $roles = $this->getLocal('roles.json', TPIRoleExpandedDto::class, true);
        $reminders = $this->getLocal('reminders.json', TPIReminderExpandedDto::class, true);
        $jinxes = $this->getLocal('jinxes.json', JinxDto::class, true);
        $games = $this->getLocal('game.yaml', GameDto::class, true);
        $scripts = $this->getLocal(
            'scripts.yaml',
            ScriptDto::class,
            true,
            function (string $contents, string $type) {
                $data = [];
                $json = Yaml::parse($contents);

                foreach ($json as $key => $value) {
                    $roles = array_filter($value, 'is_string');
                    $meta = $this->misc->arrayFind($value, fn($item) => is_array($item));
                    $data[] = new $type(key: $key, roles: $roles, meta: $meta);
                }

                return $data;
            },
        );

        if (
            !is_null($roles['error'])
            || !is_null($reminders['error'])
            || !is_null($jinxes['error'])
            || !is_null($games['error'])
            || !is_null($scripts['error'])
        ) {
            $io->error(
                $roles['error']
                ?? $reminders['error']
                ?? $jinxes['error']
                ?? $games['error']
                ?? $scripts['error']
            );
            return Command::FAILURE;
        }

        $locales = $this->localesModel->getLocales();
        /* TEMP */ $locales = array_slice($locales, 0, 1);
        $bar = null; // Created in verbose mode.

        if ($output->isVerbose()) {
            $io->writeln('Done');
            $io->section('Downloading translations and writing files');
            $bar = $io->createProgressBar(count($locales));
            $bar->start();
        }

        $tableHeaders = [
            'Locale',
            'Official jinxes',
            'Official reminders',
            'Official roles',
            'Community jinxes',
            'Community roles',
        ];
        $tableBody = [];

        foreach ($locales as $locale) {
            if ($output->isVerbose()) {
                $bar->advance();
            }

            $bodyIndex = count($tableBody);
            $tableBody[$bodyIndex] = [
                'code' => $locale['code'],
                'o_jinxes' => '',
                'o_reminders' => '',
                'o_roles' => '',
                'c_jinxes' => '',
                'c_roles' => '',
            ];
            $official = $this->getOfficial($locale['tpi']);

            if (!empty($official['error'])) {
                $io->error($official['error']);
                return Command::FAILURE;
            }

            $tableBody[$bodyIndex]['o_jinxes'] = $this->dataValidator->stringifyViolations($official['jinxes']['violations']) ?: 'Valid ✓';
            $tableBody[$bodyIndex]['o_reminders'] = $this->dataValidator->stringifyViolations($official['reminders']['violations']) ?: 'Valid ✓';
            $tableBody[$bodyIndex]['o_roles'] = $this->dataValidator->stringifyViolations($official['roles']['violations']) ?: 'Valid ✓';

            if (
                (
                    !empty($official['jinxes']['violations'])
                    || !empty($official['reminders']['violations'])
                    || !empty($official['roles']['violations'])
                )
                && !$io->ask(
                    "{$locale['code']} official has validation errors. Include it?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                continue;
            }

            $community = $this->getCommunity(
                $locale['community']['jinxes'],
                $locale['community']['roles'],
            );

            $tableBody[$bodyIndex]['c_jinxes'] = $this->dataValidator->stringifyViolations($community['jinxes']['violations']) ?: 'Valid ✓';
            $tableBody[$bodyIndex]['c_roles'] = $this->dataValidator->stringifyViolations($community['roles']['violations']) ?: 'Valid ✓';

            if (
                !empty($community['jinxes']['error'])
                || !empty($community['roles']['error'])
            ) {
                $io->error($community['jinxes']['error'] ?? $community['roles']['error']);
                return Command::FAILURE;
            }
            
            if (
                (
                    !empty($community['jinxes']['violations'])
                    || !empty($community['roles']['violations'])
                )
                && !$io->ask(
                    "{$locale['code']} community has validation errors. Include it?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                continue;
            }

            $translatedReminders = $this->translationModel->translateReminders(
                $reminders['data'],
                $official['reminders']['data'],
                $community['roles']['data'],
            );
            /*$translatedRoles = $this->translationModel->translateRoles(
                $roles['dto'],
                $official['roles']['dto'],
                $community['roles']['dto'],
                $translatedReminders,
            );*/
            /*$translatedJinxes = $this->translationModel->translateJinxes(
                $jinxes['dto'],
                $official['jinxes']['dto'],
                $community['jinxes']['dto'],
            );*/
            /*var_export([
                '$locale[\'code\']' => $locale['code'],
                '$reminders[\'data\']' => $reminders['data'],
                '$official[\'reminders\'][\'data\']' => $official['reminders']['data'],
                '$community[\'roles\'][\'data\']' => $community['roles']['data'],
                '$translatedReminders' => $translatedReminders,
            ]);*/
        }
        /*
        // Keep PHPStan happy.
        assert($roles['dto'] !== null);
        assert($reminders['dto'] !== null);
        assert($jinxes['dto'] !== null);
        assert($games['dto'] !== null);
        assert($scripts['dto'] !== null);

        $gamesArray = $games['dto']->toArray();
        $scriptsArray = $scripts['dto']->toArray();
        $locales = $this->localesModel->getLocales();
        $bar = null; // Created in verbose mode.

        if ($output->isVerbose()) {
            $io->writeln('Done');
            $io->section('Downloading translations and writing files');
            $bar = $io->createProgressBar(count($locales));
            $bar->start();
        }

        foreach ($locales as $locale) {
            $official = $this->getOfficial($locale['tpi']);

            if (!empty($official['error'])) {
                $io->error($official['error']);
                return Command::FAILURE;
            }

            if (
                (
                    !empty($official['jinxes']['violations'])
                    || !empty($official['reminders']['violations'])
                    || !empty($official['roles']['violations'])
                )
                && !$io->ask(
                    "{$locale['code']} official has validation errors. Include it?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                continue;
            }

            $community = $this->getCommunity(
                $locale['community']['jinxes'],
                $locale['community']['roles'],
            );

            if (
                !empty($community['jinxes']['error'])
                || !empty($community['roles']['error'])
            ) {
                $io->error($community['jinxes']['error'] ?? $community['roles']['error']);
                return Command::FAILURE;
            }
            
            if (
                (
                    !empty($community['jinxes']['violations'])
                    || !empty($community['roles']['violations'])
                )
                && !$io->ask(
                    "{$locale['code']} community has validation errors. Include it?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                continue;
            }

            // Keep PHPStan happy.
            // Note: the official translation for this locale might be null.
            assert($community['jinxes']['dto'] !== null);
            assert($community['roles']['dto'] !== null);

            $translatedReminders = $this->translationModel->translateReminders(
                $reminders['dto'],
                $official['reminders']['dto'],
                $community['roles']['dto'],
            );
            $translatedRoles = $this->translationModel->translateRoles(
                $roles['dto'],
                $official['roles']['dto'],
                $community['roles']['dto'],
                $translatedReminders,
            );
            $translatedJinxes = $this->translationModel->translateJinxes(
                $jinxes['dto'],
                $official['jinxes']['dto'],
                $community['jinxes']['dto'],
            );

            $contents = $this->createContents(
                $translatedRoles,
                $translatedJinxes,
                $gamesArray,
                $scriptsArray,
                $output->isVeryVerbose(),
            );

            if ($this->storage->write(
                Storage::LOCATION_COMPILED,
                "aa__{$locale['code']}.js",
                $contents,
            ) === false) {
                $io->error("Unable to write {$locale['code']}.js");
                return Command::FAILURE;
            }

            // TODO: Output the results in a table.
            // TODO: Check the translations - a lot of English text :(
            // TODO: Remove the prefix from the filename.

            if ($output->isVerbose()) {
                $bar->advance();
            }
        }
        */

        if ($output->isVerbose()) {
            $bar->finish();
            $io->writeln('');
            $io->writeln('');
            $io->section('Results');
            $io->table($tableHeaders, $tableBody);
        }

        $io->success('Translations downloaded and written');
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
     * Reads the JSON or Yaml from the given file name and passes it into the
     * given DTO, allowing it to be validated.
     *
     * @template Type
     * @param string $filename Name of the file to parse.
     * @param class-string<Type> $type Class string for the DTO class.
     * @param bool $isArray Whether or not the DTO is an array.
     * @param ?(callable(string, string, bool): (Type|array<Type>)) $map Optional map to convert the data from the file contents.
     * @return ($isArray is true ? array{data: ?Type[], error: ?string, violations: array<string, string[]>} : array{data: ?Type, error: ?string, violations: array<string, string[]>})
     * Results of the data being parsed and validated.
     */
    protected function getLocal(
        string $filename,
        string $type,
        bool $isArray = false,
        ?callable $map = null,
    ): array {
        $response = [
            'data' => null,
            'error' => null,
            'violations' => [],
        ];
        $data = null;
        
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $contents = $this->storage->read(
            $extension === 'yaml' ? Storage::LOCATION_CONFIG : Storage::LOCATION_RAW,
            $filename,
        );

        if ($contents === false) {
            $response['error'] = "Cannot read '{$filename}'";
            return $response;
        }

        try {
            if (is_callable($map)) {
                $response['data'] = $map($contents, $type, $isArray);
            } else {
                $response['data'] = $this->serializer->deserialize(
                    $contents,
                    $isArray ? "{$type}[]" : $type,
                    $extension,
                );
            }
        } catch (\Exception $e) {
            $response['error'] = "{$filename}: {$e->getMessage()}";
            return $response;
        }

        $response['violations'] = $this->dataValidator->validate($response['data']);

        return $response;
    }

    /**
     * @param ?string $tpiCode The TPI locale code, which might be null.
     * @return array{
     *  error: ?string,
     *  jinxes: array{
     *      violations: array<string, string[]>,
     *      data: ?array<TranslationJinxDto>,
     *  },
     *  reminders: array{
     *      violations: array<string, string[]>,
     *      data: ?array<TPIReminderDto>,
     *  },
     *  roles: array{
     *      violations: array<string, string[]>,
     *      data: ?array<TranslationRoleDto>,
     *  },
     * } Response from access the official translations.
     */
    protected function getOfficial(?string $tpiCode): array
    {
        $response = [
            'error' => null,
            'jinxes' => [
                'violations' => [],
                'data' => null,
            ],
            'reminders' => [
                'violations' => [],
                'data' => null,
            ],
            'roles' => [
                'violations' => [],
                'data' => null,
            ],
        ];

        if ($tpiCode === null) {
            return $response;
        }

        $raw = $this->fetch->getJson(sprintf(TPIURLEnum::GAME->value, $tpiCode));

        if (($error = $this->fetch->getLastError()) !== '') {
            $response['error'] = $error;
            return $response;
        }

        $data = [
            'jinxes' => function (array $items): array {
                $data = [];

                foreach ($items as $key => $reason) {
                    $array = ['key' => $key, 'reason' => $reason];
                    $data[] = $this->normalizer->denormalize($array, TranslationJinxDto::class);
                }

                return $data;
            },
            'reminders' => function (array $items): array {
                $data = [];

                foreach ($items as $key => $text) {
                    $array = ['key' => $key, 'text' => $text];
                    $data[] = $this->normalizer->denormalize($array, TPIReminderDto::class);
                }

                return $data;
            },
            'roles' => function (array $items): array {
                $data = [];

                foreach ($items as $key => $role) {
                    $role['key'] = $key;
                    $data[] = $this->normalizer->denormalize($role, TranslationRoleDto::class);
                }

                return $data;
            },
        ];

        foreach ($data as $key => $processor) {
            if (!array_key_exists($key, $raw)) {
                continue;
            }

            $response[$key]['data'] = $processor($raw[$key]);
            $response[$key]['violations'] = $this->dataValidator->validate($response[$key]['data']);
        }

        return $response;
    }

    /**
     * @param string $jinxes Tab name for the jinxes.
     * @param string $roles Tab name for the roles.
     * @return array{
     *  jinxes: array{
     *      error: ?string,
     *      violations: array<string, string[]>,
     *      data: ?array<CommunityJinxDto>,
     *  },
     *  roles: array{
     *      error: ?string,
     *      violations: array<string, string[]>,
     *      data: ?array<CommunityRoleDto>,
     *  },
     * } Response data.
     */
    protected function getCommunity(string $jinxes, string $roles): array
    {
        $response = [
            'jinxes' => [
                'error' => null,
                'violations' => [],
                'data' => null,
            ],
            'roles' => [
                'error' => null,
                'violations' => [],
                'data' => null,
            ],
        ];

        $dto = [
            'jinxes' => [
                'url' => sprintf(
                    CommunityTranslationEnum::JINXES->value,
                    rawurlencode($jinxes),
                ),
                'map' => [
                    'Target' => 'target',
                    'Trick' => 'trick',
                    'Reason' => 'reason',
                ],
                'processor' => function (array $items): array {
                    return array_map(function ($item) {
                        return $this->normalizer->denormalize($item, CommunityJinxDto::class);
                    }, $items);
                },
            ],
            'roles' => [
                'url' => sprintf(
                    CommunityTranslationEnum::ROLES->value,
                    rawurlencode($roles),
                ),
                'processor' => function (array $items): array {
                    return array_map(function ($item) {
                        foreach ($item as $key => $value) {
                            if (trim($value) === '') {
                                $item[$key] = null;
                            }

                            if ($key === 'reminders' || $key === 'remindersGlobal') {
                                $value = array_filter(array_map('trim', explode(',', trim($value))));

                                $item[$key] = count($value) ? $value : null;
                            }
                        }

                        return $this->normalizer->denormalize($item, CommunityRoleDto::class);
                    }, $items);
                },
            ],
        ];

        foreach ($dto as $type => $info) {
            $contents = $this->fetch->getContents($info['url']);

            if (($error = $this->fetch->getLastError()) !== '') {
                $response[$type]['error'] = $error;
                continue;
            }

            $csv = [];
            
            foreach ($this->csv->parseArray($contents, $info['map'] ?? []) as $row) {
                $safe = [];

                foreach ($row as $header => $cell) {
                    $safe[$header] = $this->misc->removeMarkup($cell);
                }

                $csv[] = $safe;
            }

            $response[$type]['data'] = $info['processor']($csv);
            $response[$type]['violations'] = $this->dataValidator->validate($response[$type]['data']);

            /*
            $stripped = $this->misc->removeMarkup($contents);
            $csv = $this->csv->parseArray($stripped, $info['map'] ?? []);
            $response[$type]['data'] = $info['processor']($csv);
            $response[$type]['violations'] = $this->dataValidator->validate($response[$type]['data']);

            var_export([
                '$type' => $type,
                '$info[\'url\']' => $info['url'],
                '$info[\'map\']' => $info['map'] ?? null,
                '$contents' => $contents,
                '$stripped' => $stripped,
                '$csv' => $csv,
            ]);
             */
        }


        return $response;
    }

    /**
     * Creates the contents that will be saved to a file.
     *
     * @param RolesArray $roles
     * @param JinxesArray $jinxes
     * @param GamesArray $game
     * @param ScriptsArray $scripts
     * @param bool $isPretty If true, the generated file will be formatted.
     * @return string Contents to be written.
     */
    protected function createContents(
        array $roles,
        array $jinxes,
        array $game,
        array $scripts,
        bool $isPretty = false,
    ): string {
        $data = [
            'roles' => $roles,
            'jinxes' => $jinxes,
            'game' => $game,
            'scripts' => $scripts,
        ];
        $contents = 'var PG=' . json_encode(
            $data,
            $isPretty ? JSON_PRETTY_PRINT : 0,
        ) . ';';

        return $contents;
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
