<?php
/**
 * initial APP environment.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

use APP\Config;
use APP\Exceptions\RunTimeException;

class Environment
{
    private static string $version = '8.0.0';

    public static function checkVersion(): void
    {
        if (version_compare(phpversion(), self::$version, '<')) {
            throw new RunTimeException('Your PHP version is old '.phpversion().'! Please Updateto PHP version '.self::$version.' or hight to use this APP!');
        }
    }

    public static function initialiseErrorHandler(): void
    {
        $errorPrint = !empty(Config::DEBUG);

        ini_set('display_errors', $errorPrint ? 1 : 0);
        ini_set('display_startup_errors', $errorPrint ? 1 : 0);
        error_reporting($errorPrint ? E_ALL : 0);

        set_error_handler(function ($number, $error, $file, $line) use ($errorPrint) {
            $error = htmlspecialchars($error);

            $level = match ($number) {
                E_USER_ERROR => 'ERROR: ',
                E_USER_WARNING => 'WARNING: ',
                E_USER_NOTICE => 'NOTICE: ',
                default => 'Error: ',
            };
            $error = "$level <b>$error</b>";

            if ($errorPrint) {
                $error .= " in $file on $line";
            }
            throw new RunTimeException($error);
        }, E_ALL);
    }

    public static function setEnvironment(): void
    {
        // Disable caching.
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Cache-Control: post-check=0, pre-check=0', false);
        header('Pragma: no-cache');
    }
}
