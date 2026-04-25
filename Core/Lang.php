<?php
/**
 * APP Language management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

use APP\Exceptions\RunTimeException;

class Lang
{
    private string $path = 'Assets/Dictionaries/';

    private array $langs = [
        'EN' => '🇬🇧 English',
        'RU' => '🇷🇺 Русский',
        'DE' => '🇩🇪 Deutsch',
    ];

    private array $defDict = [
        'Add note' => 'Add note',
        'Export' => 'Export',
        'Import' => 'Import',
        'Create new note' => 'Create new note',
        'Creates a new note that includes a note name and note color' => 'Creates a new note that includes a note name and note color.',
        'Cancel' => 'Cancel',
        'Create' => 'Create',
        'Title' => 'Title',
        'Title of note' => 'Title of note',
        'Delete' => 'Delete',
        'Delete a note' => 'Delete a note',
        'By clicking on Delete, you delete only the shortcut. If you want to delete a note from the server, first clear the note and the note will be deleted from the server' => 'By clicking on Delete, you delete only the shortcut. If you want to delete a note from the server, first clear the note and the note will be deleted from the server.',
        'Edit' => 'Edit',
        'Edit a note' => 'Edit a note',
        'Change the name of the note or the color of the note' => 'Change the name of the note or the color of the note.',
        'Theme' => 'Theme',
        'There was a problem communicating with the server' => 'There was a problem communicating with the server!',
        'Password' => 'Password',
        'Password protection' => 'Password protection',
        'Set password' => 'Set password',
        'Remove password' => 'Remove password',
        'Print' => 'Print',
        'Share' => 'Share',
        'File cannot be read' => 'File cannot be read!',
        'Setting' => 'Setting',
        'Font' => 'Font',
        'Sans serif' => 'Sans serif',
        'Serif' => 'Serif',
        'Monospace' => 'Monospace',
        'Background' => 'Background',
        'Simple' => 'Simple',
        'Lined' => 'Lined',
        'Checkered' => 'Checkered',
        'Dotted' => 'Dotted',
        'Fontsize' => 'Fontsize',
        'Extra small' => 'Extra small',
        'Small' => 'Small',
        'Medium' => 'Medium',
        'Large' => 'Large',
        'Extra large' => 'Extra large',
        'Spellcheck' => 'Spellcheck',
        '_Yes' => 'Yes',
        '_No' => 'No',
        'An error occurred on content paste clipboard data' => 'An error occurred on content paste clipboard data!',
        'An error occurred while trying to share content' => 'An error occurred while trying to share content!',
        'It is not possible to save, a false password has been entered' => 'It is not possible to save, a false password has been entered!',
        'Give the password' => 'Give the password',
        'Unlock' => 'Unlock',
        'Remove' => 'Remove',
        'Do you want to delete the password' => 'Do you want to delete the password?',
        'Enter password to unlock note' => 'Enter password to unlock note.',
        'Repeat the password' => 'Repeat the password',
        'Password-protected notes are encrypted directly in your browser and sent to the server' => 'Password-protected notes are encrypted directly in your browser and sent to the server.',
        'Remember your password, otherwise you wont be able to decode the note' => 'Remember your password, otherwise you won\'t be able to decode the note!',
        'Do you want to set a password for the note' => 'Do you want to set a password for the note?',
        'Password was not specified' => 'Password was not specified!',
        'The passwords do not match' => 'The passwords do not match!',
        'The given password seems to be incorrect' => 'The given password seems to be incorrect!',
        'Version' => 'Version',
        'Empty notes list' => 'There are no notes yet.',
        'No note selected' => 'No note selected',
    ];

    private array $dict = [];

    public string $lang = 'EN';

    public function __construct(string $agentLang, string $settings)
    {
        $lang = strtoupper(substr($agentLang, 0, 2));

        if (!empty($settings)) {
            $setting = json_decode($settings, true);
            $lang = $setting['l'] ?? $lang;
        }

        try {
            if (!file_exists($path = $this->path.$lang.'.ini')) {
                throw new RunTimeException('File not found: '.$lang.'.ini');
            }

            $dict = parse_ini_file($path, true) ?: [];
            $this->dict = array_merge($this->defDict, $dict);
            $this->lang = $lang;
        } catch (\Exception) {
            $this->dict = $this->defDict;
        }
    }

    public function getAvailableLanguages(): array
    {
        return $this->langs;
    }

    public function __invoke(string $term): string
    {
        return $this->dict[$term] ?? $term;
    }
}
