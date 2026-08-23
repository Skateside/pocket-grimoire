<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Enums\TPIURLEnum;
use App\Model\TPIResourcesModel;
use App\Service\Fetch;
use App\Service\Storage;

#[AsCommand(name: 'pocket-grimoire:fetch')]
class FetchResourcesCommand extends Command
{
    protected $model;
    protected $fetch;
    protected $storage;

    public function __construct(
        TPIResourcesModel $model,
        Fetch $fetch,
        Storage $storage
    ) {
        $this->model = $model;
        $this->fetch = $fetch;
        $this->storage = $storage;

        return parent::__construct();
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

        $rawGame = $this->fetch->getJson(sprintf(TPIURLEnum::GAME, 'en'));

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawJinxes = $this->fetch->getJson(TPIURLEnum::JINXES);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawNightsheet = $this->fetch->getJson(TPIURLEnum::NIGHTSHEET);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawRoles = $this->fetch->getJson(TPIURLEnum::ROLES);

        if (($error = $this->fetch->getLastError()) !== '') {
            $io->error($error);
            return Command::FAILURE;
        }

        if ($output->isVerbose()) {
            $bar->advance();
            $bar->finish();
            $io->writeln('');
        }

        $jinxes = $this->model->filterJinxes($rawJinxes);
        $nightsheet = $this->model->filterNightsheet($rawNightsheet);
        $roles = $this->model->filterRoles($rawRoles);

        $rawReminders = $rawGame['reminders'] ?? [];
        $reminders = $this->model->filterReminders($rawReminders);

        if ($output->isVerbose()) {
            $io->section('Results');
            $io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Jinxes', count($rawJinxes), count($jinxes)],
                    ['Nightsheet', count($rawNightsheet), count($nightsheet)],
                    ['Roles', count($rawRoles), count($roles)],
                    ['Reminders', count($rawReminders), count($reminders)],
                ],
            );
        }
        

        if (
            count($rawJinxes) !== count($jinxes)
            || count($rawNightsheet) !== count($nightsheet)
            || count($rawRoles) !== count($roles)
            || count($rawReminders) !== count($reminders)
        ) {
            $io->warning('Some filtering occurred');
        }

        $writtenJinxes = $this->storage->writeJson(
            Storage::LOCATION_RAW,
            'jinxes.json',
            $jinxes,
            $output->isVeryVerbose() ? JSON_PRETTY_PRINT : 0,
        );

        if ($writtenJinxes === false) {
            $io->error('Failed to write jinxes');
            return Command::FAILURE;
        }

        $combined = $this->model->combineRoles(
            $roles,
            array_flip($reminders),
            $nightsheet,
        );

        $writtenReminders = $this->storage->writeJson(
            Storage::LOCATION_RAW,
            'reminders.json',
            $reminders,
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
