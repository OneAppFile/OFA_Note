<?php
/**
 * note content management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

use APP\Config;
use const APP\ROOT_DIR;

class Content
{
    public array $settings = [
        'font' => 'font-sans',
        'bg' => 'bg-lined',
        'size' => 'size-m',
        'spellcheck' => false,
        'lock' => false,
        'proof' => '',
    ];

    private array $settingsDefault = [
        'font' => ['font-sans', 'font-serif', 'font-monospace'],
        'bg' => ['bg-blank', 'bg-lined', 'bg-checkered', 'bg-dotted'],
        'size' => ['size-xs', 'size-s', 'size-m', 'size-l', 'size-xl'],
        'spellcheck' => [false, true],
        'lock' => [false, true],
    ];

    private array $code = ['d', 'e', 'a', 'c', 'h', 'i', 'l', 'p', 'o', 'z', 'n'];

    protected string $path;

    private string $divider = PHP_EOL.'~=~ ✄ ~=~ ✄ ~=~'.PHP_EOL;

    private string $content = '';

    public function __construct(
        protected Config $config,
        protected Input $input,
    ){
        $path = trim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $config::STORAGE), DIRECTORY_SEPARATOR);

        $this->path = ROOT_DIR.DIRECTORY_SEPARATOR.$path.DIRECTORY_SEPARATOR;
    }

    /**
     * extract setting from array, validate and store in settings property.
     */
    public function fetchSetting(): void
    {
        foreach ($this->settings as $key => $value) {
            $opts = $this->input->post($key);

            if (isset($this->settingsDefault[$key])) {
                $this->settings[$key] = in_array($opts, $this->settingsDefault[$key]) ? $opts : $value;
            } else {
                $this->settings[$key] = $opts;
            }
        }
    }

    /**
     * set content.
     */
    public function setContent(string $note, string $text): void
    {
        $file = $this->path.$this->config::STORAGE_PREFIX.$note;

        if (strlen($text)) {
            $this->makeStorageDir(0755);
            file_put_contents($file, '///'.serialize($this->settings).'///'.$this->divider.$text);
        } else {
            unlink($file);
        }
    }

    /**
     * create new unique note key.
     */
    public function generateNoteKey(): string
    {
        $this->makeStorageDir(0755);

        do {
            $note = str_replace(array_keys($this->code), array_values($this->code), time())
                . substr(str_shuffle('234579abcdefghjkmnpqrstwxyz'), -6);
            $file = $this->path.$this->config::STORAGE_PREFIX.$note;
        } while (is_file($file));

        return $note;
    }

    public function loadContent(string $note): void
    {
        $file = $this->path.$this->config::STORAGE_PREFIX.$note;
        $this->content = is_readable($file) ? file_get_contents($file) : '';


        // extract settings
        if (false !== ($pos = strpos($this->content, PHP_EOL))) {
            try {
                $settings = substr($this->content, 0, $pos);
                $this->settings = array_merge($this->settings, unserialize(trim($settings, '/')));
            } catch (\Throwable) {
                /* use default settings */
            }

            $this->content = substr($this->content, $pos + 1);
        }

        // remove divider
        if (false !== ($pos = strpos($this->content, PHP_EOL))) {
            $this->content = substr($this->content, $pos);
        }
    }

    public function getContent(): string
    {
        return $this->content;
    }

    /**
     * extract setting from array, validate and store in settings property.
     */
    public function extractSetting(array $opts): void
    {
        foreach ($this->settings as $key => $value) {
            if (isset($opts[$key])) {
                if (isset($this->settingsDefault[$key])) {
                    $this->settings[$key] = in_array($opts[$key], $this->settingsDefault[$key]) ? $opts[$key] : $value;
                } else {
                    $this->settings[$key] = $opts[$key];
                }
            }
        }
    }

    /**
     * try to create storage direction.
     */
    private function makeStorageDir(int $mode = 0777): void
    {
        if (!file_exists($this->path)) {
            mkdir($this->path, $mode, true);
        }

        chmod($this->path, $mode);
    }
}
