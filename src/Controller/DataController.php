<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

use App\Repository\HomebrewRepository;
use App\Service\Fetch;
use App\Model\BotcScriptModel;

#[Route("/{_locale}/data", name: "data_")]
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

    #[Route("/url", name: "url")]
    public function urlAction(
        Request $request,
        TranslatorInterface $translator
    ): Response {
        $url = $request->query->get('url', '');
        $json = $this->fetch->getJson($url);
        $error = $this->fetch->getLastError($translator);

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

    #[Route("/get-game", name: "get_game")]
    public function getGameAction(
        Request $request,
        TranslatorInterface $translator,
    ): Response
    {

        $game = $request->query->get('game', '');

        if ($game === '' || !$this->homebrewRepo->isValidUUID($game)) {
            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.homebrew_json.invalid_uuid'),
            ]);
        }

        $entry = $this->homebrewRepo->findOneBy(['uuid' => $game]);

        if (!$entry) {
            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.homebrew_json.unrecognised_uuid'),
            ]);
        }

        return new JsonResponse([
            'success' => true,
            'data' => $entry->getJson(),
        ]);

    }

    #[Route("/get-botc", name: "get_botc")]
    public function lookupAction(
        Request $request,
        CacheInterface $cache,
        BotcScriptModel $model,
        TranslatorInterface $translator,
    ): Response {
        $query = []; 

        if (
            ($term = $request->query->get('term', ''))
            && strlen(trim($term)) > 0
        ) { 
            $lowercase = strtolower($term);
            $trimmed = trim(str_replace('  ', ' ', $lowercase));
            $query['search'] = substr($trimmed, 0, 100);
        }

        if (empty($query)) {
            return new JsonResponse([
                'success' => false,
                'message' => $translator->trans('errors.botc_scripts.invalid_search'),
            ]);
        }

        $query['ordering'] = '-score';

        $url = sprintf(
            'https://botcscripts.com/api/scripts/?%s',
            http_build_query($query),
        );

        return $cache->get(
            hash('sha256', $url),
            function (ItemInterface $item) use ($url, $model, $translator) {
                $item->expiresAfter(600); // 10 minutes

                if (
                    ($json = $this->fetch->getJson($url)) === null
                    && (($lastError = $this->fetch->getLastError($translator)) !== '')
                ) {
                    return new JsonResponse([
                        'success' => false,
                        'message' => $lastError,
                    ]);
                }

                $converted = $model->convert($json);

                if (!$converted['success']) {
                    return new JsonResponse([
                        'success' => false,
                        'message' => $converted['body'],
                    ]);
                }

                return new JsonResponse([
                    'success' => true,
                    'data' => $converted['body'],
                ]);
            },
        );
    }
}
