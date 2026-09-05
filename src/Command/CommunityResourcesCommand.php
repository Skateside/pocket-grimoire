<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\LocalesModel;
#use App\Service\Storage;

#[AsCommand(name: 'pocket-grimoire:community')]
class CommunityResourcesCommand extends Command
{
    protected LocalesModel $localesModel;
    #protected Storage $storage;

    public function __construct(
        LocalesModel $localesModel,
        #Storage $storage,
    ) {
        $this->localesModel = $localesModel;
        #$this->storage = $storage;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($output->isVerbose()) {
            $io->title('Getting community resources');
        }

        $tabs = $this->localesModel->getLocales(function (array $locale) {
            return $locale['community']['roles'];
        });
        $io->writeln(implode(', ', $tabs));

        return Command::SUCCESS;
    }
}

