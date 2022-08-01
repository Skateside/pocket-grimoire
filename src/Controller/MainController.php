<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\Repository\RoleRepository;
use App\Repository\JinxRepository;

class MainController extends AbstractController
{

    private $roleRepo;
    private $jinxRepo;

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo
    ) {
        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
    }

    /**
     * @Route("/", name="index_stub")
     */
    public function indexStubAction(Request $request): Response
    {
        return $this->redirectToRoute('index', $request->query->all(), 301);
    }

    /**
     * @Route("/sheet", name="sheet_stub")
     */
    public function sheetStubAction(Request $request): Response
    {
        return $this->redirectToRoute('sheet', $request->query->all(), 301);
    }

    /**
     * @Route("/{_locale}/", name="index")
     */
    public function indexAction(): Response
    {
        return $this->render('pages/index.html.twig');
    }

    /**
     * @Route("/{_locale}/sheet", name="sheet")
     */
    public function sheetAction(Request $request): Response
    {

        // $ids = explode(',', $request->query->get('characters'));
        $groups = [];
        $jinxes = [];

        if ($characters = $request->query->get('characters')) {

            $this->discoverCharacters(
                array_map(function ($id) {
                    return $this->roleRepo->findOneBy(['identifier' => $id]);
                }, explode(',', $characters)),
                $groups,
                $jinxes
            );

        } else if ($game = $request->query->get('game')) {

            // Get information from the HomebrewRecord instances.

        }

        return $this->render('pages/sheet.html.twig', [
            'name' => $request->query->get('name'),
            'groups' => $groups,
            'jinxes' => $jinxes
        ]);

    }

    private function discoverCharacters(
        array $characters,
        array &$groups,
        array &$jinxes
    ) {

        foreach ($characters as $character) {

            $team = $character->getTeam();
            $teamId = $team->getIdentifier();

            if (!array_key_exists($teamId, $groups)) {

                $groups[$teamId] = [
                    'team' => $team,
                    'characters' => []
                ];

            }

            $groups[$teamId]['characters'][] = $character;

            foreach ($character->getJinxes() as $jinx) {

                if (
                    in_array($jinx->getTarget()->getIdentifier(), $ids)
                    && in_array($jinx->getTrick()->getIdentifier(), $ids)
                ) {

                    $jinx->setActive(true);
                    $jinxes[] = $jinx;

                }

            }

        }

    }

}
