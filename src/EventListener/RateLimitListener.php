<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[AsEventListener(event: KernelEvents::REQUEST)]
class RateLimitListener
{
    public function __construct(
        private readonly RateLimiterFactory $apiLimiter,
    ) {
    }

    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if (!$this->shouldRateLimit($request)) {
            return;
        }

        $identifier = $this->getIdentifier($request);

        $limit = $this->apiLimiter
            ->create($identifier)
            ->consume(1);

        if (!$limit->isAccepted()) {
            throw new TooManyRequestsHttpException(
                $limit->getRetryAfter()->getTimestamp() - time(),
            );
        }
    }

    protected function shouldRateLimit(Request $request): bool
    {
        return in_array(
            $request->attributes->get('_route'),
            [
                'data_get_botc',
            ],
            true,
        );
    }

    protected function getIdentifier(Request $request): string
    {
        return $request->getClientIp() ?? 'unknown';
    }
}
