<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Enums\TPIURLEnum;
use App\Model\TPIResourcesModel;
use App\Service\{
    Fetch,
    Storage,
};
use App\Dto\JinxesDto;

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

        $rawGame = $this->fetch->getJson(sprintf(TPIURLEnum::GAME->value, 'en'));

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawJinxes = $this->fetch->getJson(TPIURLEnum::JINXES->value);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawNightsheet = $this->fetch->getJson(TPIURLEnum::NIGHTSHEET->value);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawRoles = $this->fetch->getJson(TPIURLEnum::ROLES->value);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
            $bar->finish();
            $io->writeln('');
        }

        $jinxes = JinxesDto::from($rawJinxes);
        $nightsheet = $this->resourcesModel->filterNightsheet($rawNightsheet);
        $roles = $this->resourcesModel->filterRoles($rawRoles);

        $jinxViolations = $this->validator->validate($jinxes);

        if (count($jinxViolations)) {
            $errors = [];
            foreach ($jinxViolations as $violation) {
                $errors[$violation->getPropertyPath()][] = $violation->getMessage();
            }

            $io->writeln(json_encode($errors));
        }

        $rawReminders = $rawGame['reminders'] ?? [];
        $reminders = $this->resourcesModel->filterReminders($rawReminders);

        if ($output->isVerbose()) {
            $io->section('Results');
            $io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Jinxes', count($rawJinxes), count($rawJinxes)],
                    ['Nightsheet', count($rawNightsheet), count($nightsheet)],
                    ['Roles', count($rawRoles), count($roles)],
                    ['Reminders', count($rawReminders), count($reminders)],
                ],
            );
        }
        

        if (
            count($rawNightsheet) !== count($nightsheet)
            || count($rawRoles) !== count($roles)
            || count($rawReminders) !== count($reminders)
        ) {
            $io->warning('Some filtering occurred');
        }

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
            $roles,
            array_flip($reminders),
            $nightsheet,
        );
        $expanded = $this->resourcesModel->expandReminders($reminders, $roles);

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

        return Command::SUCCESS;
    }
}
