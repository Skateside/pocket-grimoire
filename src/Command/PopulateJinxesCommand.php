<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

use App\Repository\JinxRepository;

class PopulateJinxesCommand extends Command
{

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $defaultName = 'pocket-grimoire:populate-jinxes';

    private $repo;
    private $em;

    public function __construct(
        JinxRepository $repo,
        EntityManagerInterface $em
    ) {

        $this->repo = $repo;
        $this->em = $em;

        parent::__construct();

    }

    protected function configure(): void
    {

        $this
            ->addOption(
                'file',
                'f',
                InputOption::VALUE_REQUIRED,
                'Which file should be imported?',
                ''
            )
            ->addOption(
                'locale',
                'l',
                InputOption::VALUE_OPTIONAL,
                'While locale is the file in?',
                self::DEFAULT_LOCALE
            );

    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {

        $io = new SymfonyStyle($input, $output);
        $file = $input->getOption('file');
        $locale = $input->getOption('locale');

        $json = json_decode(file_get_contents($file), true);

        if (is_null($json)) {
            $io->error("Unable to decode JSON from file '{$file}'");
            return Command::FAILURE;
        }

        $listing = [];

        foreach ($json as $data) {

            $target = $data['target'];
            $trick = $data['trick'];

            if (!($jinx = $this->repo->getByTargetTrick($target, $trick))) {

                $listing[] = "WARNING: Unable to find a Jinx for '{$target}' and '{$trick}'";
                continue;

            }

            $jinx
                ->setTranslatableLocale($locale)
                ->setReason($data['reason']);
            $this->em->persist($jinx);
            $listing[] = "Jinx reason for '{$target}' and '{$trick}' updated for locale {$locale}";

        }

        $io->listing($listing);
        $this->em->flush();
        $io->success('Jinxes updated');

        return Command::SUCCESS;

    }

}
