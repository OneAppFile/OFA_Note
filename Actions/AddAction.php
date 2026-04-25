<?php
/**
 * action for add new note.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

use APP\Exceptions\RunTimeException;

class AddAction extends AbstractAction
{
    /**
     * @throws RunTimeException
     */
    public function index(): string
    {
        return json_encode(['note' => $this->app->content->generateNoteKey()]);
    }
}
