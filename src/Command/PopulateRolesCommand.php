<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Role;
use App\Repository\RoleRepository;
use App\Entity\Edition;
use App\Repository\EditionRepository;
use App\Entity\Team;
use App\Repository\TeamRepository;

class PopulateRolesCommand extends Command
{

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $defaultName = 'pocket-grimoire:populate-roles';

    private $roleRepo;
    private $editionRepo;
    private $teamRepo;
    private $cache;
    private $em;

    public function __construct(
        RoleRepository $roleRepo,
        EditionRepository $editionRepo,
        TeamRepository $teamRepo,
        EntityManagerInterface $em
    ) {

        $this->cache = [
            'roles' => [],
            'editions' => [],
            'teams' => []
        ];

        $this->roleRepo = $roleRepo;
        $this->editionRepo = $editionRepo;
        $this->teamRepo = $teamRepo;
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

            $role = $this->getRole($data, $locale);
            $listing[] = "Role '{$role->getIdentifier()}' found/created for locale {$locale}";

            if ($locale !== self::DEFAULT_LOCALE) {

                $role
                    ->setTranslatableLocale($locale)
                    ->setName($data['name'])
                    ->setAbility($data['ability']);

                if (!empty($data['firstNightReminder'])) {
                    $role->setFirstNightReminder($data['firstNightReminder']);
                }

                if (!empty($data['otherNightReminder'])) {
                    $role->setOtherNightReminder($data['otherNightReminder']);
                }

                if (count($data['reminders'])) {
                    $role->setReminders($data['reminders']);
                }

                if (
                    array_key_exists('remindersGlobal', $data)
                    && count($data['remindersGlobal'])
                ) {
                    $role->setRemindersGlobal($data['remindersGlobal']);
                }

                $this->em->persist($role);
                $listing[] = "Role '{$role->getIdentifier()}' updated for locale {$locale}";

            }

        }

        if (empty($listing)) {
            $io->warning('No roles updated or created');
            return Command::SUCCESS;
        }

        $io->listing($listing);
        $this->em->flush();
        $io->success('Roles updated');

        return Command::SUCCESS;

    }

    private function getTeam($identifier): Team
    {

        if (!array_key_exists($identifier, $this->cache['teams'])) {

            $team = $this->teamRepo->findOneBy(['identifier' => $identifier]);
            $this->cache['teams'][$identifier] = $team;

        }

        return $this->cache['teams'][$identifier];

    }

    private function getEdition($identifier): Edition
    {

        if (!array_key_exists($identifier, $this->cache['editions'])) {

            $edition = $this->editionRepo->findOneBy(['identifier' => $identifier]);
            $this->cache['editions'][$identifier] = $edition;

        }

        return $this->cache['editions'][$identifier];

    }

    private function getRole(array $data, string $locale): Role
    {

        $identifier = $data['id'];

        if (!array_key_exists($identifier, $this->cache['roles'])) {

            $role = $this->roleRepo->findOneBy(['identifier' => $identifier]);

            if (is_null($role)) {

                $role = $this->createRole($data, $locale);
                $this->em->persist($role);

            }

            $this->cache['roles'][$identifier] = $role;

        }

        return $role;

    }

    private function createRole(array $data, string $locale): Role
    {

        $role = new Role();
        $role
            ->setTranslatableLocale($locale)
            ->setIdentifier($data['id'])
            ->setName($data['name'])
            ->setSetup($data['setup'] ?? false)
            ->setAbility($data['ability'])
            ->setImage($data['image'] ?? '');

        if (
            array_key_exists('firstNight', $data)
            && $data['firstNight'] > 0
        ) {

            $role
                ->setFirstNight($data['firstNight'])
                ->setFirstNightReminder($data['firstNightReminder']);

        }

        if (
            array_key_exists('otherNight', $data)
            && $data['otherNight'] > 0
        ) {

            $role
                ->setOtherNight($data['otherNight'])
                ->setOtherNightReminder($data['otherNightReminder']);

        }

        if (
            array_key_exists('reminders', $data)
            && count($data['reminders'])
        ) {
            $role->setReminders($data['reminders']);
        }

        if (
            array_key_exists('remindersGlobal', $data)
            && count($data['remindersGlobal'])
        ) {
            $role->setRemindersGlobal($data['remindersGlobal']);
        }

        if (!empty($data['team'])) {
            $role->setTeam($this->getTeam($data['team']));
        }

        if (
            array_key_exists('edition', $data)
            && !empty($data['edition'])
        ) {
            $role->setEdition($this->getEdition($data['edition']));
        }

        return $role;

    }

}
