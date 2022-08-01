<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

use App\Repository\RoleRepository;
use App\Repository\JinxRepository;
use App\Repository\HomebrewRepository;
use App\Entity\Homebrew;
use App\Model\HomebrewModel;

class MainController extends AbstractController
{

    private $roleRepo;
    private $jinxRepo;
    private $homebrewRepo;
    private $homebrewModel;

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo,
        HomebrewRepository $homebrewRepo,
        HomebrewModel $homebrewModel
    ) {
        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
        $this->homebrewRepo = $homebrewRepo;
        $this->homebrewModel = $homebrewModel;
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

            $data = $this->discoverCharacters(array_map(function ($id) {
                return $this->roleRepo->findOneBy(['identifier' => $id]);
            }, explode(',', $characters)));

            $groups = $data['groups'];
            $jinxes = $data['jinxes'];

        } else if (
            ($game = $request->query->get('game'))
            && ($homebrew = $this->homebrewRepo->findOneBy(['uuid' => $game]))
        ) {

            // Get information from the Homebrew instances.



        }

        return $this->render('pages/sheet.html.twig', [
            'name' => $request->query->get('name'),
            'groups' => $groups,
            'jinxes' => $jinxes
        ]);

    }

    /**
     * @Route("/{_locale}/homebrew", name="homebrew")
     */
    public function homebrewAction(
        Request $request,
        EntityManagerInterface $em
    ): Response {

        if ($data = $request->request->get('homebrew')) {

            if (!$this->homebrewModel->validateAllEntries($data)) {

                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid data' // TODO: translate
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
                'uuid' => $homebrew->getUuid()
            ]);

        }

        return new JsonResponse([
            'success' => false,
            'message' => 'No data sent' // TODO: translate
        ]);

    }

    private function discoverCharacters(array $characters)
    {

        $groups = [];
        $jinxes = [];

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

        return [
            'groups' => $groups,
            'jinxes' => $jinxes
        ];

    }

}
