<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

use App\Repository\HomebrewRepository;

/**
 * @Route("/{_locale}/data", name="data_")
 */
class DataController extends AbstractController
{

    private $homebrewRepo;

    public function __construct(
        HomebrewRepository $homebrewRepo,
    ) {
        $this->homebrewRepo = $homebrewRepo;
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
