<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
// use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class TranslateResourcesCommand extends Command
{
    protected static $defaultName = 'pocket-grimoire:translate';

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Convert reminders into references
        // Download translations
        // Check to see if the translation is English - if so, default to DB.
        // Write all of the things

        return Command::SUCCESS;
    }
}
