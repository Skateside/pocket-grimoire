<?php

namespace App\Controller;

use App\Entity\DrawSession;
use App\Repository\DrawSessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class DrawController extends AbstractController
{

    private $drawSessionRepo;

    public function __construct(DrawSessionRepository $drawSessionRepo)
    {
        $this->drawSessionRepo = $drawSessionRepo;
    }

    /**
     * @Route("/draw/{uuid}", name="draw_show_stub", methods={"GET"})
     */
    public function showStubAction(Request $request, string $uuid): Response
    {
        return $this->redirectToRoute(
            'draw_show',
            array_merge($request->query->all(), [
                '_locale' => $request->getLocale(),
                'uuid' => $uuid,
            ]),
            301
        );
    }

    /**
     * @Route("/{_locale}/draw", name="draw_create", methods={"POST"})
     */
    public function createAction(
        Request $request,
        EntityManagerInterface $em
    ): Response {

        $data = $this->decodeRequestJson($request);
        $rawCharacters = $data['characters'] ?? [];
        $sheet = $this->normaliseSheet($data['sheet'] ?? []);

        if (!is_array($rawCharacters)) {
            return $this->jsonError('No characters were sent.', Response::HTTP_BAD_REQUEST);
        }

        $characters = [];
        foreach ($rawCharacters as $index => $entry) {

            $character = $this->normaliseCharacterEntry($entry, $index);

            if ($character) {
                $characters[] = $character;
            }

        }

        if (!count($characters)) {
            return $this->jsonError('No valid characters were sent.', Response::HTTP_BAD_REQUEST);
        }

        shuffle($characters);

        $slots = array_map(function (array $entry, int $index): array {

            return [
                'number' => $index + 1,
                'drawKey' => $entry['drawKey'],
                'characterId' => $entry['characterId'],
                'character' => $entry['character'],
                'claimToken' => null,
                'claimedAt' => null,
                'name' => '',
                'submitted' => false,
                'submittedAt' => null,
            ];

        }, $characters, array_keys($characters));

        $slots[0]['sheet'] = $sheet;

        $created = new \DateTime();
        $expiresAt = (clone $created)->modify('+12 hours');

        $session = (new DrawSession())
            ->setUuid(bin2hex(random_bytes(16)))
            ->setCreated($created)
            ->setExpiresAt($expiresAt)
            ->setSlots($slots);

        $em->persist($session);
        $em->flush();

        return new JsonResponse(array_merge(
            [
                'success' => true,
                'url' => $this->generateUrl(
                    'draw_show_stub',
                    ['uuid' => $session->getUuid()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
                'stateUrl' => $this->generateUrl(
                    'draw_state',
                    ['uuid' => $session->getUuid()]
                ),
            ],
            $this->formatState($session)
        ));

    }

    /**
     * @Route("/{_locale}/draw/{uuid}", name="draw_show", methods={"GET"})
     */
    public function showAction(string $uuid): Response
    {
        $session = $this->drawSessionRepo->findOneBy(['uuid' => $uuid]);

        if (!$session) {
            throw $this->createNotFoundException('Draw session not found.');
        }

        $slots = $session->getSlots();
        $sheet = $slots[0]['sheet'] ?? [];
        $sheetParameters = [];

        if (!empty($sheet['game'])) {
            $sheetParameters = [
                'game' => $sheet['game'],
                'traveller' => 0,
                'fabled' => 0,
            ];
        } else {
            $characterIds = $sheet['characters'] ?? [];

            if (!$characterIds) {
                $characterIds = array_map(function (array $slot): string {
                    return $slot['characterId'];
                }, $slots);
            }

            $sheetParameters['characters'] = implode(',', $characterIds);
        }

        if (!empty($sheet['name'])) {
            $sheetParameters['name'] = $sheet['name'];
        }

        return $this->render('pages/draw.html.twig', [
            'session' => $session,
            'sheetUrl' => $this->generateUrl('sheet', $sheetParameters),
        ]);
    }

    /**
     * @Route("/{_locale}/draw/{uuid}/state", name="draw_state", methods={"GET"})
     */
    public function stateAction(string $uuid): Response
    {
        $session = $this->drawSessionRepo->findOneBy(['uuid' => $uuid]);

        if (!$session) {
            return $this->jsonError('Draw session not found.', Response::HTTP_NOT_FOUND);
        }

        if ($session->isExpired()) {
            return $this->jsonError('This draw session has expired.', Response::HTTP_GONE);
        }

        return new JsonResponse(array_merge(
            ['success' => true],
            $this->formatState($session)
        ));
    }

    /**
     * @Route("/{_locale}/draw/{uuid}/claim", name="draw_claim", methods={"POST"})
     */
    public function claimAction(
        Request $request,
        EntityManagerInterface $em,
        string $uuid
    ): Response {

        $data = $this->decodeRequestJson($request);
        $claimToken = trim((string) ($data['claimToken'] ?? ''));

        return $this->withLockedSession($uuid, $em, function (DrawSession $session) use ($claimToken): Response {

            $slots = $session->getSlots();

            if ($claimToken) {

                foreach ($slots as $slot) {

                    if (($slot['claimToken'] ?? null) === $claimToken) {
                        return $this->jsonClaimedSlot($slot, $claimToken);
                    }

                }

            }

            foreach ($slots as $index => $slot) {

                if (!empty($slot['claimToken'])) {
                    continue;
                }

                $claimToken = bin2hex(random_bytes(16));
                $slots[$index]['claimToken'] = $claimToken;
                $slots[$index]['claimedAt'] = (new \DateTime())->format(\DateTime::ATOM);
                $session->setSlots($slots);

                return $this->jsonClaimedSlot($slots[$index], $claimToken);

            }

            return $this->jsonError(
                'Every character has already been claimed.',
                Response::HTTP_CONFLICT
            );

        });

    }

    /**
     * @Route("/{_locale}/draw/{uuid}/name", name="draw_name", methods={"POST"})
     */
    public function nameAction(
        Request $request,
        EntityManagerInterface $em,
        string $uuid
    ): Response {

        $data = $this->decodeRequestJson($request);
        $claimToken = trim((string) ($data['claimToken'] ?? ''));
        $name = trim(substr((string) ($data['name'] ?? ''), 0, 80));
        $submitted = (bool) ($data['submitted'] ?? false);

        if (!$claimToken) {
            return $this->jsonError('No claimed slot was sent.', Response::HTTP_BAD_REQUEST);
        }

        if ($submitted && $name === '') {
            return $this->jsonError('Name is required.', Response::HTTP_BAD_REQUEST);
        }

        return $this->withLockedSession($uuid, $em, function (DrawSession $session) use ($claimToken, $name, $submitted): Response {

            $slots = $session->getSlots();

            foreach ($slots as $index => $slot) {

                if (($slot['claimToken'] ?? null) !== $claimToken) {
                    continue;
                }

                $slots[$index]['name'] = $name;

                if ($submitted) {
                    $slots[$index]['submitted'] = true;
                    $slots[$index]['submittedAt'] = (new \DateTime())->format(\DateTime::ATOM);
                }

                $session->setSlots($slots);

                return new JsonResponse([
                    'success' => true,
                    'slot' => $this->formatSlot($slots[$index]),
                ]);

            }

            return $this->jsonError('Claimed slot not found.', Response::HTTP_NOT_FOUND);

        });

    }

    private function decodeRequestJson(Request $request): array
    {
        $data = json_decode($request->getContent(), true);
        return is_array($data) ? $data : [];
    }

    private function normaliseCharacterEntry($entry, int $index): ?array
    {
        $drawKey = (string) $index;
        $character = null;

        if (is_string($entry)) {
            $character = ['id' => $entry];
        } else if (is_array($entry)) {

            $drawKey = (string) ($entry['drawKey'] ?? $drawKey);
            $character = $entry['character'] ?? $entry;

        }

        if (!is_array($character) || !isset($character['id'])) {
            return null;
        }

        $character['id'] = $this->normaliseId((string) $character['id']);

        if (!$character['id']) {
            return null;
        }

        return [
            'drawKey' => $drawKey,
            'characterId' => $character['id'],
            'character' => $character,
        ];
    }

    private function normaliseSheet($sheet): array
    {
        if (!is_array($sheet)) {
            return [];
        }

        $characters = array_values(array_unique(array_filter(array_map(function ($id): string {
            return $this->normaliseId((string) $id);
        }, array_slice(is_array($sheet['characters'] ?? null) ? $sheet['characters'] : [], 0, 100)))));

        return [
            'name' => trim(substr((string) ($sheet['name'] ?? ''), 0, 255)),
            'game' => trim(substr((string) ($sheet['game'] ?? ''), 0, 255)),
            'characters' => $characters,
        ];
    }

    private function normaliseId(string $id): string
    {
        return strtolower(str_replace(['-', '_'], '', $id));
    }

    private function withLockedSession(
        string $uuid,
        EntityManagerInterface $em,
        callable $callback
    ): Response {

        $em->beginTransaction();

        try {

            $session = $this->drawSessionRepo->findOneByUuidForUpdate($uuid);

            if (!$session) {

                $em->rollback();
                return $this->jsonError('Draw session not found.', Response::HTTP_NOT_FOUND);

            }

            if ($session->isExpired()) {

                $em->rollback();
                return $this->jsonError('This draw session has expired.', Response::HTTP_GONE);

            }

            $response = $callback($session);
            $em->flush();
            $em->commit();

            return $response;

        } catch (\Throwable $exception) {

            if ($em->getConnection()->isTransactionActive()) {
                $em->rollback();
            }

            throw $exception;

        }

    }

    private function jsonClaimedSlot(array $slot, string $claimToken): Response
    {
        return new JsonResponse([
            'success' => true,
            'claimToken' => $claimToken,
            'slot' => $this->formatSlot($slot, true),
        ]);
    }

    private function formatState(DrawSession $session): array
    {
        $slots = array_map(function (array $slot): array {
            return $this->formatSlot($slot);
        }, $session->getSlots());

        return [
            'id' => $session->getUuid(),
            'expiresAt' => $session->getExpiresAt()
                ? $session->getExpiresAt()->format(\DateTime::ATOM)
                : null,
            'total' => count($slots),
            'claimedCount' => count(array_filter($slots, function (array $slot): bool {
                return $slot['claimed'];
            })),
            'submittedCount' => count(array_filter($slots, function (array $slot): bool {
                return $slot['submitted'];
            })),
            'slots' => $slots,
        ];
    }

    private function formatSlot(array $slot, bool $includeCharacter = false): array
    {
        $data = [
            'number' => $slot['number'],
            'drawKey' => $slot['drawKey'],
            'claimed' => !empty($slot['claimToken']),
            'submitted' => (bool) ($slot['submitted'] ?? false),
            'name' => (string) ($slot['name'] ?? ''),
        ];

        if ($includeCharacter) {
            $data['characterId'] = $slot['characterId'];
            $data['character'] = $slot['character'];
        }

        return $data;
    }

    private function jsonError(string $message, int $status): Response
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message,
        ], $status);
    }

}
