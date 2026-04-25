<?php
/**
 * simple route processor.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

use APP\App;
use APP\Exceptions\RunTimeException;

class Router
{
    private array $routes = [];

    private array $url = [];

    public function __construct(Input $input, array $routes)
    {
        $this->routes = $routes;

        $this->url = parse_url(
            'http'.($input->server('REQUEST_SCHEME') == 'http' ? '' : 's')
            .'://'.$input->server('HTTP_HOST').$input->server('REQUEST_URI')
        );
    }

    /**
     * return base url.
     */
    public function getBaseUrl(): string
    {
        return $this->url['scheme'].'://'.$this->url['host'].$this->url['path'];
    }

    /**
     * @throws RunTimeException
     */
    public function url(string $route, array $params = []): string
    {
        return $this->generateUrl($this->prepareRoute($route, $params));
    }

    /**
     * @throws RunTimeException
     */
    public function path(string $route, array $params = []): string
    {
        return $this->generatePath($this->prepareRoute($route, $params));
    }

    /**
     * @throws RunTimeException
     */
    public function dispatch(App $app): string
    {
        $action = $app->input->get('action') ?: '';

        if (isset($this->routes[$action])) {
            return (new $this->routes[$action]['action']($app))->index();
        }

        throw new RunTimeException('Default route not found!');
    }

    /**
     * @throws RunTimeException
     */
    private function prepareRoute(string $route, array $params = []): array
    {
        if (empty($this->routes[$route])) {
            throw new RunTimeException('Route not found: '.$route);
        }

        $params['action'] = $route;
        return array_merge((array) ($this->routes[$route]['params'] ?? []), $params);
    }

    private function generatePath(array $params): string
    {
        $par = $params['action'] ? ['action' => $params['action']] : [];
        unset($params['action']);

        $query = http_build_query(array_merge($par, $params), '', '&');
        return $this->url['path'].($query ? '?'.$query : '');
    }

    private function generateUrl(array $params): string
    {
        return $this->url['scheme'].'://'.$this->url['host'].$this->generatePath($params);
    }
}
