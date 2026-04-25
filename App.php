<?php
/**
 * APP initialize.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP;

use APP\Actions\AddAction;
use APP\Actions\DefaultAction;
use APP\Actions\ManifestAction;
use APP\Actions\MediaAction;
use APP\Actions\SaveAction;
use APP\Core\Content;
use APP\Core\Environment;
use APP\Core\Input;
use APP\Core\Lang;
use APP\Core\Router;
use APP\Core\Viewer;
use APP\Exceptions\RunTimeException;

class App
{
    private string $version = '1.0.0';

    public Content $content;

    public Config $config;

    public Viewer $viewer;

    public Input $input;

    public Lang $lang;

    public Router $router;

    /**
     * @throws RunTimeException
     */
    public function warmup(): void
    {
        Environment::checkVersion();
        Environment::initialiseErrorHandler();
        Environment::setEnvironment();
    }

    public function build(): void
    {
        $this->config = new Config();
        $this->input = new Input();

        $this->lang = new Lang(
            $this->input->server('HTTP_ACCEPT_LANGUAGE'),
            $this->input->cookie('setting', Input::TEXT) ?: '',
        );

        $this->router = new Router($this->input, [
            'media' => ['action' => MediaAction::class, 'params' => ['file' => '']],
            'manifest.json' => ['action' => ManifestAction::class],
            'save' => ['action' => SaveAction::class, 'params' => ['note' => '']],
            'add' => ['action' => AddAction::class],
            '' => ['action' => DefaultAction::class],
        ]);

        $this->content = new Content($this->config, $this->input);

        $cookies = $this->input->cookie('setting', Input::TEXT);
        $this->viewer = new Viewer(ROOT_DIR, [
            'lang' => $this->lang,
            'router' => $this->router,
            'options' => $cookies ? json_decode($cookies, true) : [],
            'version' => $this->version,
        ]);
    }

    /**
     * @throws RunTimeException
     */
    public function run(): string
    {
        return $this->router->dispatch($this);
    }
}
