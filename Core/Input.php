<?php
/**
 * handling of global variables like INPUT, POST, SERVER, COOKIE.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

class Input
{
    public const STRING = 'string';

    public const TEXT = 'text';

    public const INT = 'int';

    public const ARRAY = 'array';

    public function get(string $key, string $format = self::STRING): mixed
    {
        return $this->filter($_GET[$key] ?? null, $format);
    }

    public function post(string $key, string $format = self::STRING): mixed
    {
        return $this->filter($_POST[$key] ?? null, $format);
    }

    public function server(string $key, string $format = self::STRING): mixed
    {
        return $this->filter($_SERVER[$key] ?? null, $format);
    }

    public function cookie(string $key, string $format = self::STRING): mixed
    {
        return $this->filter($_COOKIE[$key] ?? null, $format);
    }

    private function filter(mixed $var, string $format): mixed
    {
        if (null === $var) {
            return null;
        }

        return match ($format) {
            self::ARRAY => (array) filter_var($var, FILTER_REQUIRE_ARRAY),
            self::INT => (int) filter_var($var, FILTER_SANITIZE_NUMBER_INT),
            self::TEXT => (string) $var,
            default => (string) filter_var($var, FILTER_SANITIZE_SPECIAL_CHARS),
        };
    }
}
