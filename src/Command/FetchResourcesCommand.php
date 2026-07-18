<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
// use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TPIResourcesModel;
use App\Service\Fetch;
use App\Service\Storage;

class FetchResourcesCommand extends Command
{
    protected static $defaultName = 'pocket-grimoire:fetch';
    protected $io;
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
        $this->io = new SymfonyStyle($input, $output);
        $bar = null; // Created in verbose mode.

        if ($output->isVerbose()) {
            $this->io->title('Fetching Resources');
            $this->io->section('Downloading');

            $bar = $this->io->createProgressBar(3);
            $bar->start();
        }

        $rawJinxes = $this->fetch->getJson(Fetch::URL_TPI_JINXES);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawNightsheet = $this->fetch->getJson(Fetch::URL_TPI_NIGHTSHEET);

        if ($output->isVerbose()) {
            $bar->advance();
        }

        $rawRoles = $this->fetch->getJson(Fetch::URL_TPI_ROLES);

        if ($output->isVerbose()) {
            $bar->advance();
            $bar->finish();
        }

        $this->io->writeln('');

        if (
            !$rawJinxes['success']
            || !$rawNightsheet['success']
            || !$rawRoles['success']
        ) {
            $this->io->error('Data not valid');
            return Command::FAILURE;
        }

        $jinxes = $this->model->filterJinxes($rawJinxes['body']);
        $nightsheet = $this->model->filterNightsheet($rawNightsheet['body']);
        $roles = $this->model->filterRoles($rawRoles['body']);

        if ($output->isVerbose()) {
            $this->io->section('Results');
            $this->io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Jinxes', count($rawJinxes['body']), count($jinxes)],
                    ['Nightsheet', count($rawNightsheet['body']), count($nightsheet)],
                    ['Roles', count($rawRoles['body']), count($roles)],
                ],
            );
        }
        

        if (
            count($rawJinxes['body']) !== count($jinxes)
            || count($rawNightsheet['body']) !== count($nightsheet)
            || count($rawRoles['body']) !== count($roles)
        ) {
            $this->io->warning('Some filtering occurred');
        }

        $writtenJinxes = $this->storage->writeJson('jinxes.json', Storage::LOCATION_DATA, $jinxes);

        if ($writtenJinxes === false) {
            $this->io->error('Failed to write jinxes');
            return Command::FAILURE;
        }

        $combined = $this->model->combineRoles($roles, $nightsheet);

        $writtenRoles = $this->storage->writeJson('characters.json', Storage::LOCATION_DATA, $combined);

        if ($writtenRoles === false) {
            $this->io->error('Failed to write characters');
            return Command::FAILURE;
        }

        $this->io->success('Characters and Jinxes files written');

        return Command::SUCCESS;
    }
}
