<?php
/**
 * simple template engine.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP\Core;

use APP\Exceptions\RunTimeException;

class Viewer
{
    private string $code = '';

    public function __construct(
        private string $rootPath = '',
        private array $globals = [],
    ) {
    }

    /**
     * view template content.
     * @throws RunTimeException
     */
    public function show(string $template, array $values = []): string
    {
        $this->code = $this->includeFiles($template);
        $values = $this->extendVariables($values);

        $this->compileBlock();
        $this->compileRemarks();
        $this->compileRawEchos();
        $this->compileEchos();
        $this->compilePHP();

        ob_start();
        extract($values, EXTR_SKIP);
        eval("?".">$this->code");
        $content = ob_get_clean();
        flush();

        return $content;
    }

    /**
     * extends variables with global extends.
     */
    private function extendVariables(array $var): array
    {
        foreach ($this->globals as $key => $value) {
            $var[$key] = $value;
        }

        return $var;
    }

    /**
     * include template content.
     * @throws RunTimeException
     */
    private function includeFiles(string $template): string
    {
        $template = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $template);
        $template = $this->rootPath.DIRECTORY_SEPARATOR.trim($template, DIRECTORY_SEPARATOR);

        if (!is_readable($template)) {
            throw new RunTimeException("Source $template in Assets not found!");
        }

        return $this->searchIncludes(file_get_contents($template));
    }

    private function searchIncludes($code): string
    {
        preg_match_all('/{% ?(extends|include) ?\'?(.*?)\'? ?%}/i', $code, $matches, PREG_SET_ORDER);
        foreach ($matches as $value) {
            $code = str_replace($value[0], $this->includeFiles($value[2]), $code);
        }

        return preg_replace('/{% ?(extends|include) ?\'?(.*?)\'? ?%}/i', '', $code);
    }

    /**
     * include compile blocks.
     */
    private function compileBlock(): void
    {
        $blocks = [];

        preg_match_all('/{% ?block ?(.*?) ?%}(.*?){% ?endblock ?%}/is', $this->code, $matches, PREG_SET_ORDER);
        foreach ($matches as $value) {
            if (!array_key_exists($value[1], $blocks)){
                $blocks[$value[1]] = '';
            }

            $blocks[$value[1]] = strpos($value[2], '@parent') === false
                ? $value[2]
                : str_replace('@parent', $blocks[$value[1]], $value[2]);

            $this->code = str_replace($value[0], '', $this->code);
        }

        foreach($blocks as $block => $value) {
            $this->code = preg_replace('/{% ?yield ?' . $block . ' ?%}/', $value, $this->code);
        }

        $this->code = preg_replace('/{% ?yield ?(.*?) ?%}/i', '', $this->code);
    }

    /**
     * remove remarks in code.
     *  Example: {# remark #}
     */
    private function compileRemarks(): void
    {
        $this->code = preg_replace('~\{#\s*(.+?)\s*#}~is', '', $this->code);
    }

    /**
     * replace variables with escaped output in code.
     *  Example: {{{ $variable }}}
     */
    private function compileRawEchos():void
    {
        $this->code = preg_replace('~{{{\s*(.+?)\s*}}}~is', '<?php echo $1 ?>', $this->code);
    }

    /**
     * replace variables in code.
     *  Example: {{ $variable }}
     */
    private function compileEchos(): void
    {
        $this->code = preg_replace('~{{\s*(.+?)\s*}}~is', '<?php echo htmlentities($1, ENT_QUOTES, "UTF-8") ?>', $this->code);
    }

    /**
     * replace php function in code.
     * Example: {% echo $variable %}
     */
    private function compilePHP(): void
    {
        $this->code = preg_replace('~\{%\sset\s*(.+?)\s*%}~is', '<?php $1 ?>', $this->code);
        $this->code = preg_replace('~\{%\s*(.+?)\s*%}~is', '<?php $1 ?>', $this->code);
    }
}
