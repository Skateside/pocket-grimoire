<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Edition;
use App\Repository\EditionRepository;

class PopulateEditionsCommand extends Command
{

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $defaultName = 'pocket-grimoire:populate-editions';

    private $repo;
    private $cache;
    private $em;

    public function __construct(
        EditionRepository $repo,
        EntityManagerInterface $em
    ) {

        $this->cache = [];
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

        foreach ($json as $rawEdition) {

            $edition = $this->getEdition($rawEdition, $locale);
            $listing[] = "Edition '{$edition->getIdentifier()}' found/created for locale {$locale}";

            if ($locale !== self::DEFAULT_LOCALE) {

                $edition
                    ->setTranslatableLocale($locale)
                    ->setName($data['name']);
                $this->em->persist($edition);
                $listing[] = "Edition '{$edition->getIdentifier()}' updated for locale {$locale}";

            }

        }

        if (empty($listing)) {
            $io->warning('No editions updated or created');
            return Command::SUCCESS;
        }

        $io->listing($listing);
        $this->em->flush();
        $io->success('Editions updated');

        return Command::SUCCESS;

    }

    private function getEdition(array $data, string $locale): Edition
    {

        if (!array_key_exists($data['id'], $this->cache)) {

            $team = $this->repo->findOneBy(['identifier' => $data['id']]);

            if (is_null($team)) {

                $team = new Edition();
                $team
                    ->setIdentifier($data['id'])
                    ->setName($data['name'])
                    ->setTranslatableLocale($locale);
                $this->em->persist($team);

            }

            $this->cache[$data['id']] = $team;

        }

        return $this->cache[$data['id']];

    }

}
