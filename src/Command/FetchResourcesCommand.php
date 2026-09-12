<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use App\Enums\TPIURLEnum;
use App\Model\TPIResourcesModel;
use App\Service\{
    Fetch,
    Storage,
};
use App\Dto\{
    DtoInterface,
    JinxesDto,
    NightsheetDto,
    TPIRemindersDto,
    TPIRemindersExpandedDto,
    TPIRolesDto,
    TPIRolesExpandedDto,
};

#[AsCommand(name: 'pocket-grimoire:fetch')]
class FetchResourcesCommand extends Command
{
    protected TPIResourcesModel $resourcesModel;
    protected Fetch $fetch;
    protected Storage $storage;
    protected ValidatorInterface $validator;

    public function __construct(
        TPIResourcesModel $resourcesModel,
        Fetch $fetch,
        Storage $storage,
        ValidatorInterface $validator,
    ) {
        $this->resourcesModel = $resourcesModel;
        $this->fetch = $fetch;
        $this->storage = $storage;
        $this->validator = $validator;

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

        $roles = $this->getJson(TPIURLEnum::ROLES->value, TPIRolesDto::class);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $jinxes = $this->getJson(TPIURLEnum::JINXES->value, JinxesDto::class);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $nightsheet = $this->getJson(TPIURLEnum::NIGHTSHEET->value, NightsheetDto::class);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $reminders = $this->getJson(
            sprintf(TPIURLEnum::GAME->value, 'en'),
            function (array $fetched) {
                return TPIRemindersDto::from($fetched['reminders']);
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

        foreach ($data as $results) {
            if (!is_null($results['error'])) {
                $io->error($results['error']);
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
                    is_null($results['dto']) ? 0 : count($results['dto']->toArray()),
                    count($results['violations']) ? $this->stringifyViolations($results['violations']) : 'None ✓',
                ];

                $tableBody[] = $body;
            }

            $io->table($tableHeaders, $tableBody);
        }

        $writing = [
            'jinxes.json' => [
                'data' => $jinxes['dto']->toArray(),
                'dto' => JinxesDto::class,
            ],
            'reminders.json' => [
                'data' => $this->resourcesModel->expandReminders(
                    $reminders['dto']->toArray(),
                    $roles['dto']->toArray(),
                ),
                'dto' => TPIRemindersExpandedDto::class,
            ],
            'characters.json' => [
                'data' => $this->resourcesModel->expandRoles(
                    $roles['dto']->toArray(),
                    $nightsheet['dto']->toArray(),
                    array_flip($reminders['dto']->toArray()),
                ),
                'dto' => TPIRolesExpandedDto::class,
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
            $written = $this->storage->writeJson(
                Storage::LOCATION_RAW,
                $filename,
                $data['data'],
                $output->isVeryVerbose() ? JSON_PRETTY_PRINT : 0,
            );

            if ($written === false) {
                $io->error("Failed to write {$filename}");
                return Command::FAILURE;
            }

            if ($output->isVerbose()) {
                $dto = $data['dto']::from($data['data']);
                $violations = $this->validator->validate($dto);

                $tableBody[] = [
                    $filename,
                    count($violations) ? $this->stringifyViolations($this->convertViolations($violations)) : 'None ✓',
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

        /*
        $writtenJinxes = $this->storage->writeJson(
            Storage::LOCATION_RAW,
            'jinxes.json',
            $jinxes->toArray(),
            $output->isVeryVerbose() ? JSON_PRETTY_PRINT : 0,
        );

        if ($writtenJinxes === false) {
            $io->error('Failed to write jinxes');
            return Command::FAILURE;
        }

        $combined = $this->resourcesModel->combineRoles(
            $roles->toArray(),
            array_flip($reminders),
            $nightsheet->toArray(),
        );
        $expanded = $this->resourcesModel->expandReminders($reminders, $roles->toArray());

        $writtenReminders = $this->storage->writeJson(
            Storage::LOCATION_RAW,
            'reminders.json',
            // $reminders,
            $expanded,
            $output->isVeryVerbose() ? JSON_PRETTY_PRINT : 0,
        );

        if ($writtenReminders === false) {
            $io->error('Failed to write reminders');
            return Command::FAILURE;
        }

        $writtenRoles = $this->storage->writeJson(
            Storage::LOCATION_RAW,
            'characters.json',
            $combined,
            $output->isVeryVerbose() ? JSON_PRETTY_PRINT : 0,
        );

        if ($writtenRoles === false) {
            $io->error('Failed to write characters');
            return Command::FAILURE;
        }

        $io->success('Characters and Jinxes files written');
         */

        $io->success('Resources fetched and stored');
        return Command::SUCCESS;
    }

    /**
     * Logs any violations found.
     *
     * @param ConstraintViolationListInterface $violations Violations that
     * should be logged.
     * @param callable(array<string, string[]>): void $log Function that logs the
     * given violations.
     */
    /*
    protected function logViolations(
        ConstraintViolationListInterface $violations,
        callable $log,
    ): void {
        if (!count($violations)) {
            return;
        }

        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()][] = (string) $violation->getMessage();
        }

        $log($errors);
    }
     */

    /**
     * Gets the JSON from the remote source, passes the data into a DTO class,
     * and returns an array detailing the results.
     *
     * @param string $url URL where the JSON is located.
     * @param (callable(array<mixed>): DtoInterface)|string $dtoClass Class string for the DTO class.
     * @return array{dto: ?DtoInterface, error: ?string, violations: array<string, string[]>}
     * Results of the JSON being parsed and validated.
     */
    protected function getJson(
        string $url,
        callable|string $dtoClass,
    ): array
    {
        $response = [
            'dto' => null,
            'error' => null,
            'violations' => [],
        ];

        $fetched = $this->fetch->getJson($url);

        if (($error = $this->fetch->getLastError()) !== '') {
            $response['error'] = $error;
            return $response;
        }

        $response['dto'] = is_callable($dtoClass) ? $dtoClass($fetched) : $dtoClass::from($fetched);
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
     * Converts the violations into a string.
     *
     * @param array<string, string[]> $violations
     * @return string A string containing any violations.
     */
    protected function stringifyViolations(array $violations): string
    {
        $strings = [];

        foreach ($violations as $path => $messages) {
            $inner = [$path];

            foreach ($messages as $message) {
                $inner[] = "\t" . $message;
            }

            $strings[] = implode(PHP_EOL, $inner);
        }

        return implode(PHP_EOL, $strings);
    }
}
