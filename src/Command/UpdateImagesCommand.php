<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RoleRepository;

class UpdateImagesCommand extends Command
{

    protected static $defaultName = 'pocket-grimoire:update-images';

    private $em;
    private $roleRepo;

    public function __construct(
        EntityManagerInterface $em,
        RoleRepository $roleRepo,
    ) {

        $this->em = $em;
        $this->roleRepo = $roleRepo;

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

        $total = count($json);
        $updated = 0;

        foreach ($json as $roleData) {

            $role = $this->roleRepo->findOneBy(['identifier' => $roleData['id']]);

            if (is_null($role)) {
                $io->writeln("Unable to find role '{$roleData['id']}'");
                continue;
            }

            $role->setImage($roleData['image']);
            $this->em->persist($role);
            $updated += 1;

        }

        $this->em->flush();
        $io->writeln("Updated {$updated} of {$total} role(s)");

        return Command::SUCCESS;

    }

}
