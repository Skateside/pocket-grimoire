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

class OrderRolesCommand extends Command
{

    protected static $defaultName = 'pocket-grimoire:order-roles';

    public function __construct(
        RoleRepository $repo,
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
            );

    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {

        $io = new SymfonyStyle($input, $output);
        $file = $input->getOption('file');
        $json = json_decode(file_get_contents($file), true);

        if (is_null($json)) {
            $io->error("Unable to decode JSON from file '{$file}'");
            return Command::FAILURE;
        }

        $filtered = [
            'firstNight' => $this->populateRoles($json['firstNight']),
            'otherNight' => $this->populateRoles($json['otherNight'])
        ];
        $table = [];

        array_walk($filtered['firstNight'], function ($role, $i) use (&$table) {

            $role->setFirstNight($i + 1);
            $this->em->persist($role);

            if (count($table) <= $i) {
                $table[$i] = ['', '', ''];
            }

            $table[$i][0] = $i + 1;
            $table[$i][1] = $role->getName();

        });

        array_walk($filtered['otherNight'], function ($role, $i) use (&$table) {

            $role->setOtherNight($i + 1);
            $this->em->persist($role);

            if (count($table) <= $i) {
                $table[$i] = ['', '', ''];
            }

            $table[$i][0] = $i + 1;
            $table[$i][2] = $role->getName();

        });

        $this->em->flush();
        $io->table(['Order', 'First Night', 'Other Night'], $table);
        $io->success('Role orders updated');
        return Command::SUCCESS;

    }

    private function populateRoles($names): array
    {

        $roles = array_map([$this, 'getRole'], $names);
        $filtered = array_filter($roles);

        return array_values($filtered);

    }

    private function getRole($name): ?Role
    {

        if (!array_key_exists($name, $this->cache)) {

            $role = $this->repo->findOneBy(['name' => $name]);
            $this->cache[$name] = $role;

        }

        return $this->cache[$name];

    }

}
