<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Team;
use App\Repository\TeamRepository;

class PopulateTeamsCommand extends Command
{

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $defaultName = 'pocket-grimoire:populate-teams';

    private $repo;
    private $cache;
    private $em;

    public function __construct(
        TeamRepository $repo,
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

        foreach ($json as $rawTeam) {

            $team = $this->getTeam($rawTeam, $locale);
            $listing[] = "Team '{$team->getIdentifier()}' found/created for locale {$locale}";

            if ($locale !== self::DEFAULT_LOCALE) {

                $team
                    ->setTranslatableLocale($locale)
                    ->setName($rawTeam['name']);
                $this->em->persist($team);
                $listing[] = "Team '{$team->getIdentifier()}' updated for locale {$locale}";

            }

        }

        if (empty($listing)) {
            $io->warning('No teams updated or created');
            return Command::SUCCESS;
        }

        $io->listing($listing);
        $this->em->flush();
        $io->success('Teams updated');

        return Command::SUCCESS;

    }

    private function getTeam(array $data, string $locale): Team
    {

        if (!array_key_exists($data['id'], $this->cache)) {

            $team = $this->repo->findOneBy(['identifier' => $data['id']]);

            if (is_null($team)) {

                $team = new Team();
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
