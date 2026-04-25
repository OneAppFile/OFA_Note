<?php
/**
 * default action.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

use APP\Exceptions\RunTimeException;

class DefaultAction extends AbstractAction
{
    /**
     * @throws RunTimeException
     */
    public function index(): string
    {
        // Disable caching.
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Cache-Control: post-check=0, pre-check=0", false);
        header("Pragma: no-cache");

        $note = (string) $this->app->input->get('note');
        if ($note) {
            $this->app->content->loadContent($note);
        }

        return $this->app->viewer->show('Assets/Templates/home.html.twig', [
            'title' => 'Note',
            'note' => $note,
            'settings' => $note ? $this->app->content->settings : null,
            'content' => $note ? $this->app->content->getContent() : null,
        ]);
    }
}
