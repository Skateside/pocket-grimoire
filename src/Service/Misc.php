<?php

namespace App\Service;

class Misc
{
    /**
     * Removes any markup from the given string. Unlike strip_tag() which leaves
     * the contents of the tags in the result, this function removes the
     * contents as well.
     *
     * @param string $string String whose markup should be removed.
     * @return string Original string with markup removed.
     */
    public function removeMarkup(string $string): string
    {
        if (empty(trim($string))) {
            return '';
        }

        $document = new \DOMDocument();
        $document->loadHTML(
            "<html><head><meta charset=\"utf-8\"></head><body>{$string}</body></html>",
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NOERROR | LIBXML_NOWARNING,
        );

        $body = $document->getElementsByTagName('body')->item(0);

        if (!$body) {
            return '';
        }

        foreach ($body->getElementsByTagName('*') as $node) {
            if ($node->parentNode) {
                $node->parentNode->removeChild($node);
            }
        }

        return trim($body->textContent);
    }

    /**
     * Equivalent of array_all() for PHP < 8.4.
     *
     * @template Value
     * @template Key
     * @param array<Key, Value> $array Array to check.
     * @param callable(Value, Key): bool $callback Callback for checking.
     * @return bool true if all values and keys match the callback, false
     * otherwise.
     */
    public function arrayAll(array $array, callable $callback): bool
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key) !== true) {
                return false;
            }
        }

        return true;
    }

    /**
     * Equivalent of array_find_key() for PHP < 8.4.
     *
     * @template Value
     * @template Key
     * @param array<Key, Value> $array Array to search through.
     * @param callable(Value, Key): bool $callback Callback for checking.
     * @return ?Key The key matching the callback's search or null if no match
     * was found.
     */
    public function arrayFindKey(array $array, callable $callback): mixed
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key) === true) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Equivalent of array_find() for PHP < 8.4.
     *
     * @template Value
     * @template Key
     * @param array<Key, Value> $array Array to search through.
     * @param callable(Value, Key): bool $callback Callback for checking.
     * @return ?Value The value matching the callback's searching or null if no
     * match is found.
     */
    public function arrayFind(array $array, callable $callback): mixed
    {
        if (($key = $this->arrayFindKey($array, $callback)) !== null) {
            return $array[$key];
        }

        return null;
    }
}
