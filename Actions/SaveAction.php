<?php
/**
 * save note action.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

use APP\Core\Input;

class SaveAction extends AbstractAction
{
    public function index(): string
    {
        $this->app->content->fetchSetting();
        $this->app->content->setContent(
            $this->app->input->get('note'),
            $this->app->input->post('text', Input::TEXT),
        );

        return json_encode(['success' => true]);
    }
}
