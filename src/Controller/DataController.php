<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

use App\Repository\HomebrewRepository;
use App\Service\Fetch;

/**
 * @Route("/{_locale}/data", name="data_")
 */
class DataController extends AbstractController
{

    private $homebrewRepo;
    private $fetch;

    public function __construct(
        HomebrewRepository $homebrewRepo,
        Fetch $fetch
    ) {
        $this->homebrewRepo = $homebrewRepo;
        $this->fetch = $fetch;
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

        $json = $this->fetch->getJson($url);
        $error = $this->fetch->getLastError();

        if (!empty($error)) {

            return new JsonResponse([
                'success' => false,
                'message' => $error,
            ]);

        }

        return new JsonResponse([
            'success' => true,
            'data' => $json,
        ]);    
    }

    /**
     * @Route("/get-game", name="get_game")
     */
    public function getGameAction(Request $request): Response
    {

        $game = $request->query->get('game', '');

        if ($game === '' || !$this->homebrewRepo->isValidUUID($game)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid game UUID', // TODO: i18n
            ]);
        }

        $entry = $this->homebrewRepo->findOneBy(['uuid' => $game]);

        if (!$entry) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Unrecognised UUID', // TODO: i18n
            ]);
        }

        return new JsonResponse([
            'success' => true,
            'data' => $entry->getJson(),
        ]);

    }

}
