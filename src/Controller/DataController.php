<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

use App\Repository\RoleRepository;
use App\Repository\JinxRepository;
use App\Model\GameModel;

/**
 * @Route("/{_locale}/data", name="data_")
 */
class DataController extends AbstractController
{

    private $roleRepo;
    private $jinxRepo;
    private $gameModel;

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo,
        GameModel $gameModel
    ) {
        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
        $this->gameModel = $gameModel;
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
        return new JsonResponse($this->gameModel->getFeed());
    }

}
