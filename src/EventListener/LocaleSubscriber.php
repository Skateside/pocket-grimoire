<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleSubscriber implements EventSubscriberInterface
{

    private $defaultLocale;

    public function __construct(string $defaultLocale = 'en_GB')
    {
        $this->defaultLocale = $defaultLocale;
    }

    public function onKernelRequest(RequestEvent $event): void
    {

        $request = $event->getRequest();
        if (!$request->hasPreviousSession()) {
            return;
        }

        // Try to see if the locale has been set as a _locale routing parameter.
        if ($locale = $request->attributes->get('_locale')) {
            $request->getSession()->set('_locale', $locale);

        // If no explicit locale has been set on thie request, use one from the
        // session.
        } else {

            $request->setLocale(
                $request->getSession()->get('_locale', $this->defaultLocale)
            );

        }

    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => [['onKernelRequest', 20]]
        ];
    }

}
