<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Homebrew;
use App\Model\HomebrewModel;
use App\Model\GameModel;

class MainController extends AbstractController
{

    private $homebrewModel;

    public function __construct(
        HomebrewModel $homebrewModel
    ) {
        $this->homebrewModel = $homebrewModel;
    }

    #[Route("/", name: "index_stub")]
    public function indexStubAction(Request $request): Response
    {
        return $this->redirectToRoute('index', $request->query->all(), 301);
    }

    #[Route("/sheet", name: "sheet_stub")]
    public function sheetStubAction(Request $request): Response
    {
        return $this->redirectToRoute('sheet', $request->query->all(), 301);
    }

    #[Route("/{_locale}/", name: "index")]
    public function indexAction(
        GameModel $gameModel
    ): Response {
        return $this->render('pages/index.html.twig');
    }

    #[Route("/{_locale}/sheet", name: "sheet")]
    public function sheetAction(
        Request $request,
        GameModel $gameModel,
        EntityManagerInterface $em
    ): Response {

        $name = $request->query->get('name') ?? '';

        return $this->render('pages/sheet.html.twig', [
            'name' => $name,
        ]);

    }

    #[Route("/{_locale}/homebrew", name: "homebrew")]
    public function homebrewAction(
        Request $request,
        EntityManagerInterface $em,
        TranslatorInterface $translator
    ): Response {

        if ($data = json_decode($request->getContent(), true)) {

            $invalidReasons = [];

            if (
                !is_array($data)
                || !$this->homebrewModel->validateAllEntries($data, $invalidReasons)
            ) {

                return new JsonResponse([
                    'success' => false,
                    'message' => $translator->trans('messages.invalid_data'),
                    'reasons' => $invalidReasons
                ]);

            }

            $homebrew = new Homebrew();
            $homebrew
                ->setUuid(bin2hex(random_bytes(32)))
                ->setCreated(new \DateTime())
                ->setAccessed(new \DateTime())
                ->setJson($this->homebrewModel->filterAllEntries($data));

            $em->persist($homebrew);
            $em->flush();

            return new JsonResponse([
                'success' => true,
                'game' => $homebrew->getUuid()
            ]);

        }

        return new JsonResponse([
            'success' => false,
            'message' => $translator->trans('messages.no_data')
        ]);

    }

    #[Route("/tokens", name: "tokens_stub")]
    public function tokensStubAction(Request $request): Response
    {
        return $this->redirectToRoute('tokens', $request->query->all(), 301);
    }

    # [Route("/{_locale}/tokens", name: "tokens")]
    /*public function tokensAction(
        Request $request,
        RoleRepository $roleRepo,
        TeamRepository $teamRepo,
        TranslatorInterface $translator
    ): Response {

        $feed = $roleRepo->getFeed();
        $roles = [];

        foreach ($teamRepo->getTeamIds(true) as $id) {

            $roles[$id] = [
                'name' => $translator->trans('groups.' . $id),
                'tokens' => []
            ];

        }

        foreach ($roleRepo->getFeed() as $token) {

            $team = $token['team'];

            if (!array_key_exists($team, $roles)) {
                continue;
            }

            $roles[$team]['tokens'][] = $token;

        }

        foreach ($roles as $team => $data) {
            usort($data['tokens'], function ($a, $b) {
                return $a['name'] <=> $b['name'];
            });
        }

        return $this->render('pages/tokens.html.twig', [
            'roles' => $roles
        ]);

    }*/

}
