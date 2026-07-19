<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
// use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Enums\TPIURLEnum;
use App\Model\TPIResourcesModel;
use App\Service\Fetch;
use App\Service\Storage;

class FetchResourcesCommand extends Command
{
    protected static $defaultName = 'pocket-grimoire:fetch';
    protected $model;
    protected $fetch;
    protected $storage;

    public function __construct(
        TPIResourcesModel $model,
        Fetch $fetch,
        Storage $storage,
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

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawJinxes = $this->fetch->getJson(TPIURLEnum::JINXES);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawNightsheet = $this->fetch->getJson(TPIURLEnum::NIGHTSHEET);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawRoles = $this->fetch->getJson(TPIURLEnum::ROLES);

        if ($output->isVerbose()) {
            $bar->advance();
            $bar->finish();
        }

        $io->writeln('');

        if (
            !$rawGame['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
            || !$rawRoles['success']
        ) {
            $io->error('Data not valid');
            return Command::FAILURE;
        }

        $jinxes = $this->model->filterJinxes($rawJinxes['body']);
        $nightsheet = $this->model->filterNightsheet($rawNightsheet['body']);
        $roles = $this->model->filterRoles($rawRoles['body']);

        $rawReminders = $rawGame['body']['reminders'] ?? [];
        $reminders = $this->model->filterReminders($rawReminders);

        if ($output->isVerbose()) {
            $io->section('Results');
            $io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Jinxes', count($rawJinxes['body']), count($jinxes)],
                    ['Nightsheet', count($rawNightsheet['body']), count($nightsheet)],
                    ['Roles', count($rawRoles['body']), count($roles)],
                    ['Reminders', count($rawReminders), count($reminders)],
                ],
            );
        }
        

        if (
            count($rawJinxes['body']) !== count($jinxes)
            || count($rawNightsheet['body']) !== count($nightsheet)
            || count($rawRoles['body']) !== count($roles)
            || count($rawReminders) !== count($reminders)
        ) {
            $io->warning('Some filtering occurred');
        }

        $writtenJinxes = $this->storage->writeJson('jinxes.json', Storage::LOCATION_DATA, $jinxes);

        if ($writtenJinxes === false) {
            $io->error('Failed to write jinxes');
            return Command::FAILURE;
        }

        $combined = $this->model->combineRoles(
            $roles,
            array_flip($reminders),
            $nightsheet,
        );

        $writtenReminders = $this->storage->writeJson('reminders.json', Storage::LOCATION_DATA, $reminders);

        if ($writtenReminders === false) {
            $io->error('Failed to write reminders');
            return Command::FAILURE;
        }

        $writtenRoles = $this->storage->writeJson('characters.json', Storage::LOCATION_DATA, $combined);

        if ($writtenRoles === false) {
            $io->error('Failed to write characters');
            return Command::FAILURE;
        }

        $io->success('Characters and Jinxes files written');

        return Command::SUCCESS;
    }
}
