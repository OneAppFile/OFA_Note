/**
 * export / import only in frontend.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class FileExportImport {
    static #$hide = JSE.q('.hidden-part');

    static download(obj, filename, mimefile) {
        let data = 'data:'+mimefile+';charset=utf-8,' + encodeURIComponent(obj),
            a = document.createElement('a');
        a.setAttribute('href', data);
        a.setAttribute('download', filename);
        FileExportImport.#$hide.append(a);
        a.click();
        a.remove();
    }

    static upload(callback, accept=null) {
        let field = document.createElement('input');
        field.setAttribute('type', 'file');
        if (accept) {
            field.setAttribute('accept', accept);
        }

        FileExportImport.#$hide.append(field);
        field.click();

        JSE.ev('change', () => {
            field.files[0]?.text()
                .then(r => accept.toLowerCase().includes('/json') ? JSON.parse(r) : r)
                .then(data => {
                    field.remove();
                    try {
                        callback(data);
                    } catch (e) {
                        console.error(e);
                        Bullhorn.show(__('File cannot be read'));
                    }
                })
                .catch(err => {
                    field.remove();
                    console.error(err);
                    Bullhorn.show(__('File cannot be read'));
                });
        }, field);
    }
}
