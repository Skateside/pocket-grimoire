<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Monolog\Attribute\WithMonologChannel;
use App\Service\JavaScriptSourceMapper;

#[WithMonologChannel('js')]
class JavaScriptLogController extends AbstractController
{
    public function __construct(
        protected LoggerInterface $logger,
    ) {
    }

    #[Route("/_js-log", name: "js_log", methods: ["POST"])]
    public function logAction(
        Request $request,
        JavaScriptSourceMapper $sourceMapper,
    ): JsonResponse {
        if ($request->headers->get('Content-Length', 0) > 16 * 1024) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Payload too large',
            ], 413);
        }

        $data = json_decode($request->getContent(), true);
        
        if ($data === null) {
            return new JsonResponse([
                'success' => false,
                'error' => 'JSON error: ' . json_last_error_msg(),
            ], 400);
        }

        $generated = [
            'url' => $this->limitString($data['url'] ?? '', 2048),
            'line' => $data['line'] ?? null,
            'column' => $data['column'] ?? null,
        ];
        $original = null;

        if (!is_null($generated['line']) && !is_null($generated['column'])) {
            $original = $sourceMapper->resolve(
                $generated['url'],
                (int) $generated['line'],
                (int) $generated['column'],
            );
        }

        $context = [
            'generated' => $generated,
            'original' => $original,
            'stack' => $this->limitString($data['stack'] ?? '', 8192),
            'mapped_stack' => $sourceMapper->mapStack($data['stack'] ?? ''),
            'user_agent' => $request->headers->get('User-Agent'),
        ];
        $message = $this->limitString($data['message'] ?? ('JavaScript ' . $data['level']), 4096);

        switch ($data['level'] ?? 'error') {
        case 'warning':
            $this->logger->warning($message, $context);
            break;

        case 'info':
            $this->logger->info($message, $context);
            break;

        default:
            $this->logger->error($message, $context);
        }

        return new JsonResponse(['success' => true]);
    }

    protected function limitString(?string $string, int $max = 1024): string
    {
        if (!is_string($string)) {
            return '';
        }

        return mb_substr($string, 0, $max);
    }
}
