<?php
/**
 * abstract action.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Actions;

use APP\App;

abstract class AbstractAction
{
    public function __construct(protected App $app)
    {
    }
}
