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
use App\Entity\Role;
use App\Repository\RoleRepository;
use App\Entity\Edition;
use App\Repository\EditionRepository;
use App\Entity\Jinx;
use App\Repository\JinxRepository;

class ImportCommand extends Command
{

    protected static $defaultName = 'pocket-grimoire:import';

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $locales = [
        'de_DE',
        'es_AR',
        'fr_FR',
        'he_IL',
        'ja_JP',
        'nb_NO',
        'nn_NO',
        'pt_BR',
        'ru_RU',
        'sv_SE',
        'vi_VI',
        'zh_CN',
        'zh_TW'
    ];

    // The order matters. Teams must be imported first, then characters, then jinxes.
    protected static $types = [
        'teams',
        'characters',
        'jinxes'
    ];

    private $io;
    private $em;
    private $teamRepo;
    private $roleRepo;
    private $editionRepo;
    private $cache = [];

    public function __construct(
        EntityManagerInterface $em,
        TeamRepository $teamRepo,
        RoleRepository $roleRepo,
        EditionRepository $editionRepo,
        JinxRepository $jinxRepo
    ) {

        $this->em = $em;
        $this->teamRepo = $teamRepo;
        $this->roleRepo = $roleRepo;
        $this->editionRepo = $editionRepo;
        $this->jinxRepo = $jinxRepo;
        $this->cache = [
            'teams' => [],
            'roles' => [],
            'editions' => []
        ];

        parent::__construct();

    }

    protected function configure(): void
    {

        $this
            ->addOption(
                'new',
                null,
                InputOption::VALUE_OPTIONAL,
                'Add any new characters/jinxes?',
                'yes'
            )
            ->addOption(
                'type',
                't',
                InputOption::VALUE_OPTIONAL,
                'Which type to import?',
                'all'
            )
            ->addOption(
                'locale',
                'l',
                InputOption::VALUE_OPTIONAL,
                'Which locales to import? (comma-separated)',
                'all'
            )
            ;

    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {

        $this->io = new SymfonyStyle($input, $output);
        $addNew = in_array(strtolower($input->getOption('new')), ['yes', 'y', '1']);
        $types = $this->interpretOption($input->getOption('type'), self::$types);
        $locales = $this->interpretOption($input->getOption('locale'), self::$locales);
        $table = [];

        $labelSize = array_reduce($types, function ($carry, $type) {
            return max($carry, strlen($type) + 1);
        }, 0);

        if ($addNew) {
            $this->addNew($output->isVerbose());
        }

        // TODO: update all en_GB based on characters.json and jinx.json

        foreach ($types as $type) {

            $bar = $this->io->createProgressBar(count($locales));
            $bar->start();
            $label = str_pad($type . ':', $labelSize);
            $bar->setFormat(" {$label} %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%");

            foreach ($locales as $locale) {

                $imported = $this->import($type, $locale, $output->isVerbose());

                if (is_string($imported)) {
                    $this->io->warning($imported);
                }

                $table[] = [$type, $locale, $imported === true ? 'Success' : 'Error'];
                $bar->advance();

            }

            $bar->finish();
            $this->io->writeln('');

        }

        $this->io->table(['Type', 'Locale', 'Status'], $table);
        $this->io->success("Import successful for type '{$input->getOption('type')}' and locale(s) '{$input->getOption('locale')}'");

        return Command::SUCCESS;

    }

    protected function addNew(bool $output = false)
    {

        // Check all characters in `assets/data/characters.json` - add any missing ones.

        $characters = $this->read('.', 'characters');
        $missingCharacters = array_filter($characters, function ($data) {

            return is_null(
                $this->roleRepo->findOneBy(['identifier' => $data['id']])
            );

        });

        $this->io->writeln('Checking for missing characters.');
        $countMissingCharacters = count($missingCharacters);

        if ($countMissingCharacters > 0) {

            $listing = [];

            foreach ($missingCharacters as $missingCharacter) {

                $role = $this->getRole($missingCharacter, self::DEFAULT_LOCALE);
                $listing[] = "Added role '{$role->getName()}'";

            }

            $this->em->flush();

            if ($output) {
                $this->io->listing($listing);
            }

            $this->io->writeln("Added {$countMissingCharacters} missing character(s)");

        }

        // Check all jinxes in `assets/data/jinx.json` - add any missing ones.

        $jinxes = $this->read('.', 'jinx');
        $missingJinxes = [];

        foreach ($jinxes as $target) {

            $targetRole = $this->roleRepo->findOneBy(['name' => $target['id']]);

            if (is_null($targetRole)) {
                $this->io->writeln("Unable to find role '{$target['id']}'");
                continue;
            }

            foreach ($target['jinx'] as $trick) {

                $trickRole = $this->roleRepo->findOneBy(['name' => $trick['id']]);

                if (is_null($trickRole)) {
                    $this->io->writeln("Unable to find role '{$trick['id']}'");
                    continue;
                }

                $jinx = $this->jinxRepo->findOneBy([
                    'target' => $targetRole,
                    'trick' => $trickRole
                ]);

                if (is_null($jinx)) {

                    $missingJinxes[] = [
                        'target' => $targetRole,
                        'trick' => $trickRole,
                        'reason' => $trick['reason']
                    ];

                }

            }

        }

        $countMissingJinxes = count($missingJinxes);

        if ($countMissingJinxes > 0) {

            $listing = [];

            foreach ($missingJinxes as $missingJinx) {

                $jinx = new Jinx();
                $jinx
                    ->setTranslatableLocale(self::DEFAULT_LOCALE)
                    ->setTarget($missingJinx['target'])
                    ->setTrick($missingJinx['trick'])
                    ->setReason($missingJinx['reason']);
                $this->em->persist($jinx);

                $targetName = $missingJinx['target']->getName();
                $trickName = $missingJinx['trick']->getName();
                $listing[] = "Added jinx for '{$targetName}' and '{$trickName}'";

            }

            $this->em->flush();

            if ($output) {
                $this->io->listing($listing);
            }

            $this->io->writeln("Added {$countMissingJinxes} missing jinx(es)");

        }

        // Update the night order based on `assets/data/night-order.json`.

        $this->io->writeln('Updating the night order.');
        $nightOrder = $this->read('.', 'night-order');

        $firstNight = [];

        foreach ($nightOrder['firstNight'] as $firstNightName) {

            $character = $this->roleRepo->findOneBy(['name' => $firstNightName]);

            if (!is_null($character)) {

                $character->setFirstNight(
                    array_push($firstNight, $character->getName())
                );
                $this->em->persist($character);

            }

        }

        $otherNight = [];

        foreach ($nightOrder['otherNight'] as $otherNightName) {

            $character = $this->roleRepo->findOneBy(['name' => $otherNightName]);

            if (!is_null($character)) {

                $character->setOtherNight(
                    array_push($otherNight, $character->getName())
                );
                $this->em->persist($character);

            }

        }

        if (count($firstNight) && count($otherNight)) {

            if ($output) {

                $getIndex = function (string $name, int $index): string {
                    return "{$index}. {$name}";
                };

                $this->io->writeln('First night:');
                $this->io->listing(array_map($getIndex, $firstNight, array_keys($firstNight)));
                $this->io->writeln('Other nights:');
                $this->io->listing(array_map($getIndex, $otherNight, array_keys($otherNight)));

            }

            $this->io->writeln('Updated night order');

        }

    }

    protected function import(string $type, string $locale, bool $output = false)
    {

        $return = true;

        switch ($type) {

            case 'teams':

                $return = $this->importTeams($locale, $output);
                break;

            case 'characters':

                $return = $this->importCharacters($locale, $output);
                break;

            case 'jinxes':

                $return = $this->importJinxes($locale, $output);
                break;

            default:
                return "Unrecognised type '{$type}'";

        }

        return $return;

    }

    protected function importTeams(string $locale, bool $output)
    {

        $contents = $this->read('teams', $locale);

        if (is_string($contents)) {
            return $contents;
        }

        $listing = [];

        foreach ($contents as $rawTeam) {

            $team = $this->getTeam($rawTeam, $locale);
            $listing[] = "Team '{$team->getIdentifier()}' found/created for locale {$locale}";

            $team
                ->setTranslatableLocale($locale)
                ->setName($rawTeam['name']);
            $this->em->persist($team);
            $listing[] = "Team '{$team->getIdentifier()}' updated for locale {$locale}";

        }

        if (empty($listing)) {
            return 'No teams updated or created';
        }

        if ($output) {
            $this->io->listing($listing);
        }

        $this->em->flush();

        return true;

    }

    protected function importCharacters(string $locale, bool $output)
    {

        $contents = $this->read('characters', $locale);

        if (is_string($contents)) {
            return $contents;
        }

        $listing = [];

        foreach ($contents as $data) {

            $role = $this->getRole($data, $locale);
            $listing[] = "Role '{$role->getIdentifier()}' found/created for locale {$locale}";

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

        if (empty($listing)) {
            return 'No roles updated or created';
        }

        if ($output) {
            $this->io->listing($listing);
        }

        $this->em->flush();

        return true;

    }

    protected function importJinxes(string $locale, bool $output)
    {

        $contents = $this->read('jinxes', $locale);

        if (is_string($contents)) {
            return $contents;
        }

        $listing = [];

        foreach ($contents as $data) {

            $target = $data['target'];
            $trick = $data['trick'];

            if (!($jinx = $this->jinxRepo->getByTargetTrick($target, $trick))) {

                $listing[] = "WARNING: Unable to find a Jinx for '{$target}' and '{$trick}'";
                continue;

            }

            $jinx
                ->setTranslatableLocale($locale)
                ->setReason($data['reason']);
            $this->em->persist($jinx);
            $listing[] = "Jinx reason for '{$target}' and '{$trick}' updated for locale {$locale}";

        }

        if ($output) {
            $this->io->listing($listing);
        }

        $this->em->flush();

        return true;

    }

    private function interpretOption(string $option, array $all): array
    {
        return $option === 'all' ? $all : array_map('trim', explode(',', $option));
    }

    private function getFileName(string $type, string $locale): string
    {
        return realpath(dirname(__FILE__) . "/../../assets/data/{$type}/{$locale}.json");
    }

    private function getFileContents(string $file): array
    {
        return json_decode(file_get_contents($file), true);
    }

    private function read(string $type, string $locale)
    {

        $file = $this->getFileName($type, $locale);
        $contents = $this->getFileContents($file);

        if (is_null($contents)) {
            return "Unable to read file at location '{$file}'";
        }

        return $contents;

    }

    private function getTeam(array $data, string $locale): Team
    {

        if (!array_key_exists($data['id'], $this->cache['teams'])) {

            $team = $this->teamRepo->findOneBy(['identifier' => $data['id']]);

            if (is_null($team)) {

                $team = new Team();
                $team
                    ->setIdentifier($data['id'])
                    ->setName($data['name'])
                    ->setTranslatableLocale($locale);
                $this->em->persist($team);

            }

            $this->cache['teams'][$data['id']] = $team;

        }

        return $this->cache['teams'][$data['id']];

    }

    private function getEdition(string $identifier): Edition
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

        return $this->cache['roles'][$identifier];

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
            $role->setTeam($this->getTeam(['id' => $data['team']], $locale));
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
