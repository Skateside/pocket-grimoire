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
use App\Entity\Jinx;
use App\Model\HomebrewModel;
use App\Model\GameModel;

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
    public function indexAction(
        GameModel $gameModel
    ): Response {

        return $this->render('pages/index.html.twig', [
            'breakdown' => $gameModel->getTransposedFeed(),
        ]);

    }

    /**
     * @Route("/{_locale}/sheet", name="sheet")
     */
    public function sheetAction(
        Request $request,
        GameModel $gameModel,
        EntityManagerInterface $em
    ): Response {


        $groups = [];
        $jinxes = [];
        $name = '';

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

            }

            $name = $request->query->get('name');

        } else if (
            ($game = $request->query->get('game'))
            && ($homebrew = $this->homebrewRepo->findOneBy(['uuid' => $game]))
        ) {

            // Cache the teams so that we're not constantly looking them up.
            // Might save a little processing power.
            $teamMap = [];

            // Work out the IDs that we're using.
            $ids = array_reduce($homebrew->getJson(), function (array $carry, array $character): array {

                if (
                    array_key_exists('id', $character)
                    && !in_array($character['id'], $carry)
                    && !$this->homebrewModel->isMetaEntry($character)
                ) {
                    $carry[] = $character['id'];
                }

                return $carry;

            }, []);

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

                } else {

                    $characterId = $this->homebrewModel->normaliseId($character['id']);
                    $character = $this->roleRepo->findOneBy(['identifier' => $characterId]);
                    $team = $character->getTeam();
                    $teamId = $team->getIdentifier();

                    if (!in_array($characterId, $ids)) {
                        $ids[] = $characterId;
                    }

                    foreach ($character->getJinxes() as $jinx) {
                        $tempJinxes[] = $jinx;
                    }

                }

                // Convert any homebrew jinxes into Jinx entities. We need to
                // ensure that the character data has an ID to prevent an error
                // appearing if an older upload URL is checked.
                if (array_key_exists('jinxes', $character) && array_key_exists('id', $character)) {

                    $characterJinxes = [];

                    foreach ($character['jinxes'] as $maybeJinx) {

                        if (is_array($maybeJinx)) {

                            $target = (
                                $this->roleRepo->findOneBy(['identifier' => $character['id']])
                                ?? $this->roleRepo->createTemp($character)
                            );
                            $trick = (
                                $this->roleRepo->findOneBy(['identifier' => $maybeJinx['id']])
                                ?? $this->roleRepo->createTemp($maybeJinx)
                            );

                            $jinx = (new Jinx())
                                ->setTarget($target)
                                ->setTrick($trick)
                                ->setReason($maybeJinx['reason']);
                            $tempJinxes[] = $jinx;
                            $characterJinxes[] = $jinx;

                        } else {
                            $characterJinxes[] = $maybeJinx;
                        }

                    }

                    $character['jinxes'] = $characterJinxes;

                }

                if (!array_key_exists($teamId, $groups)) {

                    $groups[$teamId] = [
                        'team' => $team,
                        'characters' => []
                    ];

                }

                $groups[$teamId]['characters'][] = $character;

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

        return $this->render('pages/sheet.html.twig', [
            'name' => $name,
            'groups' => $groups,
            'jinxes' => $jinxes,
            'breakdown' => $gameModel->getTransposedFeed(),
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

    /**
     * @Route("/", name="tokens_stub")
     */
    public function tokensStubAction(Request $request): Response
    {
        return $this->redirectToRoute('tokens', $request->query->all(), 301);
    }

    /**
     * @Route("/{_locale}/tokens", name="tokens")
     */
    public function tokensAction(
        Request $request,
        RoleRepository $roleRepo,
        TeamRepository $teamRepo,
        TranslatorInterface $translator
    ) {

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

    }

}
