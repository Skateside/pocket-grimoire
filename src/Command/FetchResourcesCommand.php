<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Encoder\JsonEncode;
use App\Enums\TPIURLEnum;
use App\Model\TPIResourcesModel;
use App\Service\{
    DataValidator,
    Fetch,
    Storage,
};
use App\Dto\{
    JinxDto,
    NightsheetDto,
    TPIReminderDto,
    TPIReminderExpandedDto,
    TPIRoleDto,
    TPIRoleExpandedDto,
};

#[AsCommand(name: 'pocket-grimoire:fetch')]
class FetchResourcesCommand extends Command
{
    protected TPIResourcesModel $resourcesModel;
    protected DataValidator $dataValidator;
    protected Fetch $fetch;
    protected Storage $storage;
    protected SerializerInterface $serializer;

    public function __construct(
        TPIResourcesModel $resourcesModel,
        DataValidator $dataValidator,
        Fetch $fetch,
        Storage $storage,
        SerializerInterface $serializer,
    ) {
        $this->resourcesModel = $resourcesModel;
        $this->dataValidator = $dataValidator;
        $this->fetch = $fetch;
        $this->storage = $storage;
        $this->serializer = $serializer;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $bar = null; // Created in verbose mode.

        if ($output->isVerbose()) {
            $io->title('Fetching Resources');
            $io->section('Downloading');

            $bar = $io->createProgressBar(4);
            $bar->start();
        }

        $roles = $this->getData(TPIURLEnum::ROLES->value, TPIRoleDto::class, true);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $jinxes = $this->getData(TPIURLEnum::JINXES->value, JinxDto::class, true);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $nightsheet = $this->getData(TPIURLEnum::NIGHTSHEET->value, NightsheetDto::class);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $reminders = $this->getData(
            sprintf(TPIURLEnum::GAME->value, 'en'),
            TPIReminderDto::class,
            true,
            function (string $contents, string $type) {
                $data = [];
                $json = json_decode($contents, true);

                foreach (($json['reminders'] ?? []) as $key => $text) {
                    $data[] = new $type(key: $key, text: $text);
                }

                return $data;
            },
        );

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $data = [
            'Roles' => $roles,
            'Nightsheet' => $nightsheet,
            'Jinxes' => $jinxes,
            'Reminders' => $reminders,
        ];

        foreach ($data as $type => $results) {
            if (!is_null($results['error'])) {
                $io->error($results['error']);
                return Command::FAILURE;
            }

            if (
                count($results['violations'])
                && !$io->ask(
                    "{$type} has validation errors. Continue?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                return Command::FAILURE;
            }
        }

        if ($output->isVerbose()) {
            $bar->finish();
            $io->writeln('');
            $io->writeln('');
            $io->section('Results');

            $tableHeaders = ['Type', 'Count', 'Validation errors'];
            $tableBody = [];

            foreach ($data as $type => $results) {
                $body = [
                    $type,
                    is_null($results['data']) ? 0 : (is_array($results['data']) ? count($results['data']) : 1),
                    count($results['violations']) ? $this->dataValidator->stringifyViolations($results['violations']) : 'None ✓',
                ];

                $tableBody[] = $body;
            }

            $io->table($tableHeaders, $tableBody);
        }

        $writing = [
            'jinxes.json' => [
                'data' => $jinxes['data'],
                'type' => JinxDto::class . '[]',
            ],
            'reminders.json' => [
                'data' => $this->resourcesModel->expandReminders(
                    reminders: $reminders['data'],
                    roles: $roles['data'],
                ),
                'type' => TPIReminderExpandedDto::class . '[]',
            ],
            'roles.json' => [
                'data' => $this->resourcesModel->expandRoles(
                    roles: $roles['data'],
                    nightsheet: $nightsheet['data'],
                    reminders: $reminders['data'],
                ),
                'type' => TPIRoleExpandedDto::class . '[]',
            ],
        ];

        if ($output->isVerbose()) {
            $io->section('Writing');
            $bar = $io->createProgressBar(count($writing));
            $bar->start();

            $tableHeaders = ['Filename', 'Validation errors'];
            $tableBody = [];
        }

        foreach ($writing as $filename => $data) {
            $violations = $this->dataValidator->validate($data['data']);

            if (
                count($violations)
                && !$io->ask(
                    "{$filename} has validation errors. Continue?",
                    '(n)o',
                    function (string $input) {
                        $lower = strtolower($input);

                        return $lower === 'y' || $lower === 'yes';
                    },
                )
            ) {
                return Command::FAILURE;
            }

            $context = [];

            if ($output->isVeryVerbose()) {
                $context[JsonEncode::OPTIONS] = JSON_PRETTY_PRINT;
            }

            $written = $this->storage->write(
                Storage::LOCATION_RAW,
                $filename,
                $this->serializer->serialize($data['data'], 'json', $context),
            );

            if ($written === false) {
                $io->error("Failed to write {$filename}");
                return Command::FAILURE;
            }

            if ($output->isVerbose()) {
                $tableBody[] = [
                    $filename,
                    count($violations) ? $this->dataValidator->stringifyViolations($violations) : 'None ✓',
                ];

                $bar->advance();
            }
        }

        if ($output->isVerbose()) {
            $bar->finish();
            $io->writeln('');
            $io->writeln('');
            $io->section('Results');
            $io->table($tableHeaders, $tableBody);
        }

        $io->success('Resources fetched and stored');
        return Command::SUCCESS;
    }

    /**
     * Fetches the data from the given URL, serialises it into the format given,
     * and validates it. An array of the results is returned.
     *
     * @template Type of object
     *
     * @param string $url URL where the raw data is located.
     * @param class-string<Type> $type Data type to serialise the given data.
     * @param bool $isArray Whether or not the data should be an array of the given type.
     * @param ?(callable(string, string, bool): (Type|array<Type>)) $map Optional map to convert the data from the URL.
     * @return ($isArray is true ? array{data: ?array<Type>, error: ?string, violations: array<string, string[]>} : array{data: ?Type, error: ?string, violations: array<string, string[]>})
     * Results of the data being parsed and validated.
     */
    protected function getData(
        string $url,
        string $type,
        bool $isArray = false,
        ?callable $map = null,
    ): array {
        $response = [
            'data' => null,
            'error' => null,
            'violations' => [],
        ];
        $contents = $this->fetch->getContents($url);

        if (($error = $this->fetch->getLastError()) !== '') {
            $response['error'] = $error;
            return $response;
        }

        try {
            if (is_callable($map)) {
                $response['data'] = $map($contents, $type, $isArray);
            } else {
                $response['data'] = $this->serializer->deserialize(
                    $contents,
                    $isArray ? "{$type}[]" : $type,
                    'json',
                );
            }
        } catch (\Exception $e) {
            $response['error'] = $e->getMessage();
            return $response;
        }

        $response['violations'] = $this->dataValidator->validate($response['data']);

        return $response;
    }
}
