<?php

namespace App\Repository;

use App\Entity\Jinx;
use App\Entity\Role;
use App\Repository\RoleRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Jinx|null find($id, $lockMode = null, $lockVersion = null)
 * @method Jinx|null findOneBy(array $criteria, array $orderBy = null)
 * @method Jinx[]    findAll()
 * @method Jinx[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class JinxRepository extends ServiceEntityRepository
{

    private $roleRepo;

    public function __construct(ManagerRegistry $registry, RoleRepository $roleRepo)
    {
        parent::__construct($registry, Jinx::class);
        $this->roleRepo = $roleRepo;
    }

    public function getFeed(): array
    {

        $feed = [];

        foreach ($this->findAll() as $jinx) {

            $target = $jinx->getTarget();
            $targetId = $target->getId();

            if (!array_key_exists($targetId, $feed)) {

                $feed[$targetId] = [
                    'id' => $target->getIdentifier(),
                    'jinx' => []
                ];

            }

            $feed[$targetId]['jinx'][] = [
                'id' => $jinx->getTrick()->getIdentifier(),
                'reason' => $jinx->getReason()
            ];

        }

        return array_values($feed);

    }

    public function getByTargetTrick(string $target, string $trick): ?Jinx
    {

        return $this->findOneBy([
            'target' => $this->roleRepo->findOneBy(['identifier' => $target]),
            'trick' => $this->roleRepo->findOneBy(['identifier' => $trick])
        ]);

    }

}
