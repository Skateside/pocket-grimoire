<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
// use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TPIResourcesModel;

class FetchResourcesCommand extends Command
{
    protected static $defaultName = 'pocket-grimoire:fetch';
    protected $io;
    protected $model;

    public function __construct(
        TPIResourcesModel $model,
    ) {
        $this->model = $model;

        return parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io = new SymfonyStyle($input, $output);

        $bar = $this->io->createProgressBar(4);
        $bar->start();

        $images = $this->model->getImages();
        $bar->advance();

        $rawRoles = $this->model->getRemote(TPIResourcesModel::URL_ROLES);
        $bar->advance();
        $rawJinxes = $this->model->getRemote(TPIResourcesModel::URL_JINXES);
        $bar->advance();
        $rawNightsheet = $this->model->getRemote(TPIResourcesModel::URL_NIGHTSHEET);
        $bar->advance();

        $bar->finish();
        $this->io->writeln('');

        if (
            !is_array($images)
            || !$rawRoles['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
        ) {
            $this->io->error('Data not valid');
            return Command::FAILURE;
        }

        // $this->io->writeln(json_encode($images));
        $roles = $this->model->combineRoles(
            $rawRoles['body'],
            $rawNightsheet['body'],
            $images,
        );

        $this->io->success('FetchResourcesCommand completed');

        return Command::SUCCESS;
    }
}
