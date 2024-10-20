<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

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

    /**
     * @Route("/url", name="url")
     */
    public function urlAction(
        Request $request,
        TranslatorInterface $translator
    ): Response {

        $url = $request->query->get('url', '');

        if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {

            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.url.no_url')
            ]);

        }

        try {
            $contents = file_get_contents($url);
        } catch (\Exception $ignore) {
            // file_get_contents() returns `false` on failure, so set $contents
            // to `false` on error for a simple check.
            $contents = false;
        }

        if ($contents === false) {

            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.url.cannot_access')
            ]);

        }

        $json = json_decode($contents);

        if ($json === null) {

            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.url.not_json')
            ]);

        }

        return new JsonResponse([
            'success' => true,
            'data' => $json
        ]);

    }

}
