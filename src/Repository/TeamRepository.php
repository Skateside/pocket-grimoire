<?php

namespace App\Repository;

use App\Entity\Team;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Team|null find($id, $lockMode = null, $lockVersion = null)
 * @method Team|null findOneBy(array $criteria, array $orderBy = null)
 * @method Team[]    findAll()
 * @method Team[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TeamRepository extends ServiceEntityRepository
{

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Team::class);
    }

    public function getTeamIds($includeAll = false)
    {

        $ids = array_map(function ($team) {
            return $team->getIdentifier();
        }, $this->findAll());

        if (!$includeAll) {

            $ids = array_filter($ids, function ($id) {
                return !in_array($id, ['traveller', 'fabled']);
            });

        }

        return $ids;

    }

}
