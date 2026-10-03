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
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Dto\{
    CommunityJinxDto,
    CommunityRoleDto,
    GameDto,
    JinxDto,
    ScriptDto,
    TPIReminderDto,
    TPIReminderExpandedDto,
    TPIRoleExpandedDto,
    TranslationJinxDto,
    TranslationRoleDto,
};
use App\Enums\{
    CommunityTranslationEnum,
    TPIURLEnum,
};
use App\Model\{
    LocalesModel,
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
 * @phpstan-import-type Data from JinxDto as JinxArray
 * @phpstan-import-type Data from TPIRoleExpandedDto as RoleArray
 * @phpstan-import-type Data from GameDto as GameArray
 * @phpstan-import-type MetaEntry from ScriptDto as ScriptMetaEntry
 */
#[AsCommand(name: 'pocket-grimoire:translate')]
class TranslateResourcesCommand extends Command
{
    protected TPITranslationModel $translationModel;
    protected LocalesModel $localesModel;
    protected Csv $csv;
    protected DataValidator $dataValidator;
    protected Fetch $fetch;
    protected Misc $misc;
    protected Storage $storage;
    protected ValidatorInterface $validator;
    protected SerializerInterface $serializer;
    protected DenormalizerInterface&NormalizerInterface $normalizer;

    public function __construct(
        TPITranslationModel $translationModel,
        LocalesModel $localesModel,
        Csv $csv,
        DataValidator $dataValidator,
        Fetch $fetch,
        Misc $misc,
        Storage $storage,
        ValidatorInterface $validator,
        SerializerInterface $serializer,
        DenormalizerInterface&NormalizerInterface $normalizer,
    ) {
        $this->translationModel = $translationModel;
        $this->localesModel = $localesModel;
        $this->csv = $csv;
        $this->dataValidator = $dataValidator;
        $this->fetch = $fetch;
        $this->misc = $misc;
        $this->storage = $storage;
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

        if ($output->isVerbose()) {
            $tableHeaders = ['Game', 'Script'];
            $tableBody = [
                [
                    $this->writeViolations($games['violations']),
                    $this->writeViolations($scripts['violations']),

                ],
            ];
            $io->table($tableHeaders, $tableBody);
        }

        if (
            (
                !empty($games['violations'])
                || !empty($scripts['violations'])
            )
            && !$io->ask(
                'Game/Scripts validation errors. Continue?',
                '(n)o',
                function (string $input) {
                    $lower = strtolower($input);

                    return $lower === 'y' || $lower === 'yes';
                },
            )
        ) {
            $io->error('Command cancelled');
            return Command::FAILURE;
        }

        if (is_null($games['data'])) {
            $io->error('Games data is empty');
            return Command::FAILURE;
        }

        $gamesArray = $this->translationModel->normalizeGames($games['data']);
        $scriptsArray = $this->translationModel->normalizeScripts($scripts['data']);
        $locales = $this->localesModel->getLocales();
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
            'Extra jinxes',
            'Extra roles',
            'Copied',
        ];
        $tableBody = [];
        $hashes = [];

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
                'e_jinxes' => '',
                'e_roles' => '',
                'copied' => 'No',
            ];
            $official = $this->getOfficial($locale['tpi']);

            if (!empty($official['error'])) {
                $io->error("Error in {$locale['code']} official: {$official['error']}");
                return Command::FAILURE;
            }

            $tableBody[$bodyIndex]['o_jinxes'] = $this->writeViolations($official['jinxes']['violations']);
            $tableBody[$bodyIndex]['o_reminders'] = $this->writeViolations($official['reminders']['violations']);
            $tableBody[$bodyIndex]['o_roles'] = $this->writeViolations($official['roles']['violations']);

            if (
                !empty($official['jinxes']['violations'])
                || !empty($official['reminders']['violations'])
                || !empty($official['roles']['violations'])
            ) {
                $io->writeln('');
                $io->warning("Filtering occurred in the official translations for {$locale['code']}");
            }

            $community = $this->getCommunity(
                $locale['community']['jinxes'],
                $locale['community']['roles'],
            );

            $tableBody[$bodyIndex]['c_jinxes'] = $this->writeViolations($community['jinxes']['violations']);
            $tableBody[$bodyIndex]['c_roles'] = $this->writeViolations($community['roles']['violations']);

            if (
                !empty($community['jinxes']['error'])
                || !empty($community['roles']['error'])
            ) {
                $error = $community['jinxes']['error'] ?? $community['roles']['error'];
                $io->error("Error in {$locale['code']} community: {$error}");
                return Command::FAILURE;
            }
            
            if (
                !empty($community['jinxes']['violations'])
                || !empty($community['roles']['violations'])
            ) {
                $io->writeln('');
                $io->warning("Filtering occurred in the community translations for {$locale['code']}");
            }

            $extra = $this->getExtra($locale['code']);

            $tableBody[$bodyIndex]['e_jinxes'] = $this->writeViolations($extra['jinxes']['violations']);
            $tableBody[$bodyIndex]['e_roles'] = $this->writeViolations($extra['roles']['violations']);

            if (
                !empty($extra['jinxes']['error'])
                || !empty($extra['roles']['error'])
            ) {
                $error = $extra['jinxes']['error'] ?? $extra['roles']['error'];
                $io->error("Error in {$locale['code']} extra: {$error}");
                return Command::FAILURE;
            }
            
            if (
                !empty($extra['jinxes']['violations'])
                || !empty($extra['roles']['violations'])
            ) {
                $io->writeln('');
                $io->warning("Filtering occurred in the extra translations for {$locale['code']}");
            }

            $translatedReminders = $this->translationModel->translateReminders(
                $reminders['data'],
                $official['reminders']['data'],
                $community['roles']['data'],
            );
            $translatedRoles = $this->translationModel->translateRoles(
                $roles['data'],
                $official['roles']['data'],
                $community['roles']['data'],
                $extra['roles']['data'],
                $translatedReminders,
            );
            $translatedJinxes = $this->translationModel->translateJinxes(
                $jinxes['data'],
                $official['jinxes']['data'],
                $community['jinxes']['data'],
                $extra['jinxes']['data'],
            );

            $contents = $this->createContents(
                $translatedRoles,
                $translatedJinxes,
                $gamesArray,
                $scriptsArray,
                $output->isVeryVerbose(),
            );

            $filename = "{$locale['code']}.js";

            if ($this->storage->write(
                Storage::LOCATION_COMPILED,
                $filename,
                $contents,
            ) === false) {
                $io->error("Unable to write {$locale['code']}.js");
                return Command::FAILURE;
            }

            $hash = hash('crc32b', $contents);
            $hashedFilename = "{$locale['code']}.{$hash}.js";
            $hashes[$filename] = $hashedFilename;

            if ($this->storage->copy(
                [Storage::LOCATION_COMPILED, $filename],
                [Storage::LOCATION_PUBLIC_DATA, $hashedFilename],
            )) {
                $tableBody[$bodyIndex]['copied'] = 'Yes';
            }
        }

        if ($output->isVerbose()) {
            $bar->finish();
            $io->writeln('');
            $io->writeln('');
            $io->section('Results');
            $io->table($tableHeaders, $tableBody);
        }

        if ($this->updateManifest($hashes) === false) {
            $io->writeln('');
            $io->warning('Unable to update manifest');
        } elseif ($output->isVerbose()) {
            $io->writeln('Manifest updated');
        }

        $io->success('Translations downloaded and written');
        return Command::SUCCESS;
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
     * @return ($isArray is true ? array{all: ?Type[], data: ?Type[], error: ?string, violations: array<string, string[]>} : array{all: ?Type, data: ?Type, error: ?string, violations: array<string, string[]>})
     * Results of the data being parsed and validated.
     */
    protected function getLocal(
        string $filename,
        string $type,
        bool $isArray = false,
        ?callable $map = null,
    ): array {
        $response = [
            'all' => null,
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
                $data = $map($contents, $type, $isArray);
            } else {
                $data = $this->serializer->deserialize(
                    $contents,
                    $isArray ? "{$type}[]" : $type,
                    $extension,
                );
            }
        } catch (\Exception $e) {
            $response['error'] = "{$filename}: {$e->getMessage()}";
            return $response;
        }

        $response['all'] = $data;
        $response['violations'] = $this->dataValidator->validate($data);
        
        if ($isArray) {
            $response['data'] = array_filter($data, function ($item) {
                return count($this->dataValidator->validate($item)) === 0;
            });
        } elseif (count($response['violations']) === 0) {
            $response['data'] = $data;
        }

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

                foreach ($items as $id => $role) {
                    $role['id'] = $id;
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

            try {
                $response[$type]['data'] = $info['processor']($csv);
            } catch (\Exception $e) {
                $response[$type]['error'] = $e->getMessage();
                return $response;
            }

            $response[$type]['violations'] = $this->dataValidator->validate($response[$type]['data']);
        }


        return $response;
    }

    /**
     * @param string $locale Locale for the extra jinxes and/or roles.
     * @return array{
     *  jinxes: array{
     *      all: ?JinxDto[],
     *      data: ?JinxDto[],
     *      error: ?string,
     *      violations: array<string, string[]>,
     *  },
     *  roles: array{
     *      all: ?TPIRoleExpandedDto[],
     *      data: ?TPIRoleExpandedDto[],
     *      error: ?string,
     *      violations: array<string, string[]>,
     *  }
     * } Extra jinxes and/or roles.
     */
    protected function getExtra(string $locale): array
    {
        $extra = [
            'jinxes' => [
                'all' => null,
                'data' => null,
                'error' => null,
                'violations' => [],
            ],
            'roles' => [
                'all' => null,
                'data' => null,
                'error' => null,
                'violations' => [],
            ],
        ];
        $formats = [
            'jinxes' => JinxDto::class . '[]',
            'roles' => TPIRoleExpandedDto::class . '[]',
        ];

        foreach ($extra as $key => &$results) {
            if (!$this->storage->exists(Storage::LOCATION_RAW, $locale, "{$key}.json")) {
                continue;
            }

            $contents = $this->storage->read(Storage::LOCATION_RAW, $locale, "{$key}.json");

            if ($contents === false) {
                $results['error'] = "Cannot read '{$locale}/{$key}.json'";
                continue;
            }

            try {
                $data = $this->serializer->deserialize($contents, $formats[$key], 'json');
            } catch (\Exception $e) {
                $results['error'] = "{$locale}/{$key}.json: {$e->getMessage()}";
                continue;
            }

            $results['all'] = $data;
            $results['violations'] = $this->dataValidator->validate($data);
            $results['data'] = array_filter($data, function ($item) {
                return count($this->dataValidator->validate($item)) === 0;
            });
        }

        return $extra;
    }

    /**
     * Creates the contents that will be saved to a file.
     *
     * @param array<RoleArray> $roles
     * @param array<JinxArray> $jinxes
     * @param array<GameArray> $game
     * @param array<string, array<string|ScriptMetaEntry>> $scripts
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
     * Writes either the stringified violations or the valid string.
     *
     * @param array<string, string[]> $violations Any violations that have happened.
     * @param string $valid String to return if there are no violations.
     * @return string Validation output.
     */
    protected function writeViolations(
        array $violations,
        string $valid = 'Valid ✓',
    ): string {
        if (empty($violations)) {
            return $valid;
        }

        return $this->dataValidator->stringifyViolations($violations);
    }

    /**
     * Updates the manifest with the location of the copied files.
     *
     * @param array<string, string> $hashes
     * @return bool true if the writing was successful, false otherwise.
     */
    protected function updateManifest(array $hashes): bool
    {
        $manifest = $this->storage->readJson(
            Storage::LOCATION_PUBLIC,
            'manifest.json',
        );

        if ($manifest === false) {
            return false;
        }

        foreach ($manifest as $source => $path) {
            foreach ($hashes as $unhashed => $hashed) {
                if (strpos($source, $unhashed) === false) {
                    continue;
                }

                $manifest[$source] = str_replace($unhashed, $hashed, $source);
                unset($hashes[$unhashed]);
            }
        }

        if ($this->storage->writeJson(
            Storage::LOCATION_PUBLIC,
            'manifest.json',
            $manifest,
            JSON_PRETTY_PRINT,
        ) === false) {
            return false;
        }

        return true;
    }
}
