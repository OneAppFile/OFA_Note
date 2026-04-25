<?php
/**
 * APP entry point.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

namespace APP;

const ROOT_DIR = __DIR__;

/** OF_COMPRESSOR_IGNORE start **/
spl_autoload_register(function ($class) {
    $class = preg_replace('/^'.__NAMESPACE__.'/', '', $class);
    $class = ROOT_DIR.str_replace('\\', DIRECTORY_SEPARATOR, $class);
    include_once "$class.php";
});
/** OF_COMPRESSOR_IGNORE end **/

use APP\Exceptions\RunTimeException;

try {
    try {
        $app = new App();
        $app->warmup();
        $app->build();
        echo $app->run();
    } catch (\Exception $e) {
        throw new RunTimeException($e->getMessage());
    }
} catch (RunTimeException $e) {
    header($_SERVER['SERVER_PROTOCOL'] . " 500 Internal Server Error");

    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'.
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">'.
        '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'.
        '<title>Internal Server Error</title><style>'.
        '*,:after,:before{box-sizing:border-box}'.
        'html,body,div,h1,main{margin:0;padding:0;vertical-align:baseline;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0,0,0,0)}'.
        'body{font-family:"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif;background:#f7f7f7;color:#444;font-size:15px;line-height:1.2}'.
        'main{width:100vw;height:100vh;align-items:center;justify-content:center;display:flex}'.
        '.content{text-align:center;word-break:break-word;font-size:1rem}'.
        'h1{font-size:4rem;font-weight:700;line-height:1.5}'.
        '@media(max-width: 720px){.content{padding: 1rem;}h1{font-size: 2.5rem;}}'.
        '</style></head><body><main><div class="content"><h1>🧨 Server Error</h1><p>'.$e->getMessage().'</p></div>'.
        '</main></body></html>';
    die();
}
