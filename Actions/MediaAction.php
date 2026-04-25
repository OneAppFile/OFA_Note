<?php
/**
 * media object delivery action.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

use APP\Exceptions\RunTimeException;
use const APP\ROOT_DIR;

class MediaAction extends AbstractAction
{
    private array $mimeTypes = [
        'txt' => 'text/plain',
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'xml' => 'application/xml',
        // images
        'png' => 'image/png',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'ico' => 'image/vnd.microsoft.icon',
        'svg' => 'image/svg+xml',
    ];

    public function index(): string
    {
        try {
            $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $this->app->input->get('file'));

            $storage = [
                realpath(ROOT_DIR.DIRECTORY_SEPARATOR),
                trim($path, DIRECTORY_SEPARATOR),
            ];

            $path = implode(DIRECTORY_SEPARATOR, $storage);
            if (!is_readable($path)) {
                throw new RunTimeException('File not found');
            }

            $cont = file_get_contents($path);

            header("Content-Type: ".$this->fileToMimeType($path));
            # header("Content-Length: ". mb_strlen($cont));
            echo $cont;
            die();
        } catch (\Exception) {
            header("HTTP/1.0 404 Not Found");
            die();
        }
    }

    private function fileToMimeType(string $filename) {
        $arr = explode('.', $filename);
        $ext = strtolower(array_pop($arr));

        return $this->mimeTypes[$ext] ?? 'application/octet-stream';
    }
}
