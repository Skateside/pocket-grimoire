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

        $bar = $this->io->createProgressBar(3);
        $bar->start();

        $rawRoles = $this->fetch->getJson(Fetch::URL_TPI_ROLES);
        $bar->advance();
        $rawJinxes = $this->fetch->getJson(Fetch::URL_TPI_JINXES);
        $bar->advance();
        $rawNightsheet = $this->fetch->getJson(Fetch::URL_TPI_NIGHTSHEET);
        $bar->advance();

        $bar->finish();
        $this->io->writeln('');

        if (
            !$rawRoles['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
        ) {
            $this->io->error('Data not valid');
            return Command::FAILURE;
        }

        $this->storage->writeJson('jinxes.json', Storage::LOCATION_DATA, $rawJinxes['body']);

        $roles = $this->model->combineRoles(
            $rawRoles['body'],
            $rawNightsheet['body'],
        );

        $this->storage->writeJson('characters.json', Storage::LOCATION_DATA, $roles);

        $this->io->success('Characters and Jinxes files written');

        return Command::SUCCESS;
    }
}
