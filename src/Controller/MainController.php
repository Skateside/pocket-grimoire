<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Doctrine\ORM\EntityManagerInterface;

use App\Repository\RoleRepository;
use App\Repository\JinxRepository;
use App\Repository\TeamRepository;
use App\Repository\HomebrewRepository;
use App\Entity\Homebrew;
use App\Model\HomebrewModel;

class MainController extends AbstractController
{

    private $roleRepo;
    private $jinxRepo;
    private $teamRepo;
    private $homebrewRepo;
    private $homebrewModel;

    public function __construct(
        RoleRepository $roleRepo,
        JinxRepository $jinxRepo,
        TeamRepository $teamRepo,
        HomebrewRepository $homebrewRepo,
        HomebrewModel $homebrewModel
    ) {
        $this->roleRepo = $roleRepo;
        $this->jinxRepo = $jinxRepo;
        $this->teamRepo = $teamRepo;
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
    public function sheetAction(
        Request $request,
        EntityManagerInterface $em
    ): Response {


        $groups = [];
        $jinxes = [];
        $name = '';
        $nights = array("first"=>[], "other"=>[]);

        if ($characters = $request->query->get('characters')) {

            $ids = explode(',', $characters);
            foreach ($ids as $id) {

                $character = $this->roleRepo->findOneBy(['identifier' => $id]);
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

                $characterFirstNight = $character->getFirstNight();
                $characterOtherNight = $character->getOtherNight();
                if ($characterFirstNight != 0) {
                    $nights['first'][] = [$characterFirstNight, $character];
                }
                if ($characterOtherNight != 0) {
                    $nights['other'][] = [$characterOtherNight, $character];
                }

            }

            $name = $request->query->get('name');

        } else if (
            ($game = $request->query->get('game'))
            && ($homebrew = $this->homebrewRepo->findOneBy(['uuid' => $game]))
        ) {

            // Cache the teams so that we're not constantly looking them up.
            // Might save a little processing power.
            $teamMap = [];

            $ids = [];
            $tempJinxes = [];

            foreach ($homebrew->getJson() as $character) {

                if ($this->homebrewModel->isMetaEntry($character)) {

                    $name = $character['name'];
                    continue;

                }
                
                if (array_key_exists('team', $character)) {
                    $teamId = $character['team'];

                    if (!array_key_exists($teamId, $teamMap)) {
                        $teamMap[$teamId] = $this->teamRepo->findOneBy(['identifier' => $teamId]);
                    }
    
                    $team = $teamMap[$teamId];
                    
                    $characterFirstNight = array_key_exists('firstNight', $character) ? $character['firstNight'] : 0;
                    $characterOtherNight = array_key_exists('otherNight', $character) ? $character['otherNight'] : 0;
                } else {
                    $characterId = $this->homebrewModel->convertCharacterId($character['id']);
                    $character = $this->roleRepo->findOneBy(['identifier' => $characterId]);
                    $team = $character->getTeam();
                    $teamId = $team->getIdentifier();
                    
                    $ids[] = $characterId;
                    foreach ($character->getJinxes() as $jinx) {
                        $tempJinxes[] = $jinx;
                    }

                    $characterFirstNight = $character->getFirstNight();
                    $characterOtherNight = $character->getOtherNight();
                }

                if (!array_key_exists($teamId, $groups)) {

                    $groups[$teamId] = [
                        'team' => $team,
                        'characters' => []
                    ];

                }

                $groups[$teamId]['characters'][] = $character;

                if ($characterFirstNight != 0) {
                    $nights['first'][] = [$characterFirstNight, $character];
                }
                if ($characterOtherNight != 0) {
                    $nights['other'][] = [$characterOtherNight, $character];
                }

            }

            foreach ($tempJinxes as $jinx) {
                if (
                    in_array($jinx->getTarget()->getIdentifier(), $ids)
                    && in_array($jinx->getTrick()->getIdentifier(), $ids)
                ) {

                    $jinx->setActive(true);
                    $jinxes[] = $jinx;

                }

            }

            if ((int) $request->query->get('traveller', 0) !== 1) {
                unset($groups['traveller']);
            }

            if ((int) $request->query->get('fabled', 0) !== 1) {
                unset($groups['fabled']);
            }

            $homebrew->setAccessed(new \DateTime());
            $em->persist($homebrew);
            $em->flush();

        }

        foreach($nights as $key => $value) {
            sort($nights[$key]);
            $nights[$key] = array_map(function ($elem) {
                return $elem[1];
            }, $nights[$key]);
        }

        return $this->render('pages/sheet.html.twig', [
            'name' => $name,
            'groups' => $groups,
            'jinxes' => $jinxes,
            'nights' => $nights
        ]);

    }

    /**
     * @Route("/{_locale}/homebrew", name="homebrew")
     */
    public function homebrewAction(
        Request $request,
        EntityManagerInterface $em,
        TranslatorInterface $translator
    ): Response {

        if ($data = json_decode($request->getContent(), true)) {

            if (
                !is_array($data)
                || !$this->homebrewModel->validateAllEntries($data, $this->roleRepo)
            ) {

                return new JsonResponse([
                    'success' => false,
                    'message' => $translator->trans('messages.invalid_data')
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

}
