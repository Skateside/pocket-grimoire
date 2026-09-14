<?php

namespace App\Repository;

use App\Entity\DrawSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method DrawSession|null find($id, $lockMode = null, $lockVersion = null)
 * @method DrawSession|null findOneBy(array $criteria, array $orderBy = null)
 * @method DrawSession[]    findAll()
 * @method DrawSession[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DrawSessionRepository extends ServiceEntityRepository
{

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DrawSession::class);
    }

    public function findOneByUuidForUpdate(string $uuid): ?DrawSession
    {
        return $this->createQueryBuilder('drawSession')
            ->andWhere('drawSession.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setLockMode(LockMode::PESSIMISTIC_WRITE)
            ->getOneOrNullResult();
    }

}
