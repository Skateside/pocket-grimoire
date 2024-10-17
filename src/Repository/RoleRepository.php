<?php

namespace App\Repository;

use App\Entity\Role;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Role|null find($id, $lockMode = null, $lockVersion = null)
 * @method Role|null findOneBy(array $criteria, array $orderBy = null)
 * @method Role[]    findAll()
 * @method Role[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RoleRepository extends ServiceEntityRepository
{

    private $editionRepo;
    private $teamRepo;

    public function __construct(
        ManagerRegistry $registry,
        EditionRepository $editionRepo,
        TeamRepository $teamRepo
    ) {
        parent::__construct($registry, Role::class);
        $this->editionRepo = $editionRepo;
        $this->teamRepo = $teamRepo;
    }

    public function getFeed(): array
    {

        return array_map(function (Role $role) {

            $feed = [
                'id' => $role->getIdentifier(),
                'name' => $role->getName(),
                'edition' => '',//$role->getEdition()->getIdentifier(),
                'team' => $role->getTeam()->getIdentifier(),
                'firstNight' => $role->getFirstNight(),
                'firstNightReminder' => $role->getFirstNightReminder(),
                'otherNight' => $role->getOtherNight(),
                'otherNightReminder' => $role->getOtherNightReminder(),
                'reminders' => $role->getReminders(),
                'setup' => $role->getSetup(),
                'ability' => $role->getAbility(),
                'image' => $role->getImage(),
                'special' => $role->getSpecial()
            ];

            if ($edition = $role->getEdition()) {
                $feed['edition'] = $edition->getIdentifier();
            }

            if (
                ($remindersGlobal = $role->getRemindersGlobal())
                && count($remindersGlobal)
            ) {
                $feed['remindersGlobal'] = $remindersGlobal;
            }

            return $feed;

        }, $this->findAll());

    }

    public function createTemp(array $data): Role
    {

        $role = new Role();
        $keys = [
            'id',
            'name',
            'edition',
            'team',
            'firstNight',
            'firstNightReminder',
            'otherNight',
            'otherNightReminder',
            'reminders',
            'remindersGlobal',
            'setup',
            'ability',
            'image'
        ];
        $keyMap = ['id' => 'identifier'];
        $repos = [
            'edition' => $this->editionRepo,
            'team' => $this->teamRepo,
        ];

        foreach ($keys as $key) {

            if (!array_key_exists($key, $data) || empty($data[$key])) {
                continue;
            }

            $value = $data[$key];

            if (array_key_exists($key, $repos)) {

                $value = $repos[$key]->findOneBy(['identifier' => $value]);

                if (!$value) {
                    continue;
                }

            }

            $mapped = array_key_exists($key, $keyMap) ? $keyMap[$key] : $key;
            $method = 'set' . ucfirst($mapped);
            $role->$method($value);

        }

        return $role;

    }

}
