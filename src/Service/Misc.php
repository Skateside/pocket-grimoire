<?php

namespace App\Service;

class Misc
{
    /**
     * Removes any markup from the given string.
     *
     * @param string $string String whose markup should be removed.
     * @return string Original string with markup removed.
     */
    public function removeMarkup(string $string): string
    {
        /*
        $document = \Dom\HTMLDocument::createFromString($string);

        foreach ($document->querySelectorAll('*') as $element) {
            $element->remove();
        }

        return $document->saveHtml();
         */
        $document = new \DOMDocument();
        $document->loadHTML($string, LIBXML_NOERROR | LIBXML_NOWARNING);

        while ($element = $document->documentElement->firstChild) {
            $document->documentElement->removeChild($element);
        }

        return trim($document->textContent);
    }
}
