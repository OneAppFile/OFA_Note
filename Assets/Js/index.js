/**
 * start app.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

JSE.ready(() => {
    try {
        const list = new ListManager(),
            editor = new Editor();

        list.run();
        editor.initEditor();
        editor.run();

        new Aside();
        new ThemaChooser();
        new LanguageChooser();
    } catch (e) {
        console.info(e);
    }
});
