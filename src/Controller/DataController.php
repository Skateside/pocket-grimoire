<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
// use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

use App\Repository\RoleRepository;
use App\Repository\JinxRepository;

/**
 * @Route("/{_locale}/data", name="data_")
 */
class DataController extends AbstractController
{

    private $jinxRepo;

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo
    ) {
        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
    }

    /**
     * @Route("/characters", name="characters")
     */
    public function charactersAction(): Response
    {
        return new JsonResponse($this->roleRepo->getFeed());
    }

    /**
     * @Route("/jinx", name="jinx")
     */
    public function jinxAction(): Response
    {
        return new JsonResponse($this->jinxRepo->getFeed());
    }

    /**
     * @Route("/game", name="game")
     */
    public function gameAction(): Response
    {

        return new JsonResponse([
            ['townsfolk' => 3, 'outsider' => 0, 'minion' => 1, 'demon' => 1],
            ['townsfolk' => 3, 'outsider' => 1, 'minion' => 1, 'demon' => 1],
            ['townsfolk' => 5, 'outsider' => 0, 'minion' => 1, 'demon' => 1],
            ['townsfolk' => 5, 'outsider' => 1, 'minion' => 1, 'demon' => 1],
            ['townsfolk' => 5, 'outsider' => 2, 'minion' => 1, 'demon' => 1],
            ['townsfolk' => 7, 'outsider' => 0, 'minion' => 2, 'demon' => 1],
            ['townsfolk' => 7, 'outsider' => 1, 'minion' => 2, 'demon' => 1],
            ['townsfolk' => 7, 'outsider' => 2, 'minion' => 2, 'demon' => 1],
            ['townsfolk' => 9, 'outsider' => 0, 'minion' => 3, 'demon' => 1],
            ['townsfolk' => 9, 'outsider' => 1, 'minion' => 3, 'demon' => 1],
            ['townsfolk' => 9, 'outsider' => 2, 'minion' => 3, 'demon' => 1]
        ]);

    }

}
