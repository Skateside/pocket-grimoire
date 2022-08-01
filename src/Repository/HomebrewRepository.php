<?php

namespace App\Repository;

use App\Entity\Homebrew;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Homebrew|null find($id, $lockMode = null, $lockVersion = null)
 * @method Homebrew|null findOneBy(array $criteria, array $orderBy = null)
 * @method Homebrew[]    findAll()
 * @method Homebrew[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HomebrewRepository extends ServiceEntityRepository
{

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Homebrew::class);
    }

    /**
     * Finds all the {@link App\Entity\Homebrew} entities that haven't been
     * accessed for more than 10 days.
     *
     * @return ArrayCollection
     */
    public function findExpired()
    {

        $oldRequest = new \DateTime();
        $oldRequest->modify('-10 days');

        return $this->createQueryBuilder('h')
            ->where('h.accessed <= :oldRequest')
            ->setParameter('oldRequest', $oldRequest)
            ->getQuery()
            ->getResult();

    }

}
