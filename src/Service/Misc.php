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
        $document = \Dom\HTMLDocument::createFromString($string);

        foreach ($document->querySelectorAll('*') as $element) {
            $element->remove();
        }

        return $document->saveHtml();
    }
}
