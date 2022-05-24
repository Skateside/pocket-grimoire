<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Jinx;
use App\Repository\JinxRepository;
use App\Entity\Role;
use App\Repository\RoleRepository;

class JinxesCommand extends Command
{

    private const DEFAULT_LOCALE = 'en_GB';

    protected static $defaultName = 'pocket-grimoire:jinxes';

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo,
        EntityManagerInterface $em
    ) {

        $this->cache = [];

        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
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

        $table = [];

        foreach ($json as $data) {

            $target = $this->getRole($data['id']);

            if (is_null($target)) {

                $io->warning("Unable to find target role '{$data['id']}'");
                continue;

            }

            foreach ($data['jinx'] as $innerData) {

                $trick = $this->getRole($innerData['id']);
                $reason = $innerData['reason'];

                if (is_null($trick)) {

                    $io->warning("Unable to find trick role '{$innerData['id']}'");
                    continue;

                }

                // $jinx = null;
                $jinx = $this->jinxRepo->findOneBy([
                    'target' => $target,
                    'trick' => $trick
                ]);

                if (is_null($jinx)) {

                    $jinx = new Jinx();
                    $jinx
                        ->setTranslatableLocale($locale)
                        ->setTarget($target)
                        ->setTrick($trick)
                        ->setReason($reason);
                    $this->em->persist($jinx);

                }

                if ($locale !== self::DEFAULT_LOCALE) {

                    $jinx
                        ->setTranslatableLocale($locale)
                        ->setReason($reason);
                    $this->em->persist($jinx);

                }

                $table[] = [
                    $jinx->getTarget()->getName(),
                    $jinx->getTrick()->getName(),
                    $jinx->getReason()
                ];

            }

        }

        $this->em->flush();
        $io->table(['Target', 'Trick', 'Reason'], $table);
        $io->success('Jinxes updated');
        return Command::SUCCESS;

    }

    private function getRole($name): ?Role
    {

        if (!array_key_exists($name, $this->cache)) {

            $role = $this->roleRepo->findOneBy(['name' => $name]);
            $this->cache[$name] = $role;

        }

        return $this->cache[$name];

    }

}
