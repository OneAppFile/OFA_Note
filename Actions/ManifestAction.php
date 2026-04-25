<?php
/**
 * action to view manifest.json.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

class ManifestAction extends AbstractAction
{
    public function index(): string
    {
        header("Content-Type: application/manifest+json");
        return $this->app->viewer->show('Assets/Templates/manifest.json.twig');
    }
}
