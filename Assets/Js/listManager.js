/**
 * dashboard app page.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class ListManager {
    #$root = JSE.q('main');

    #$hide = JSE.q('.hidden-part');

    #$list = JSE.q('.note-list', this.#$root);

    #$anchor = JSE.q('.empty', this.#$list);

    #$note = JSE.q('.note-content .note', this.#$root);

    #$tpl = new Viewer(JSE.q('template.template'), this.#$hide);

    #storedKey = null;

    #dialog = {
        add: JSE.q('dialog#add-dialog', this.#$root),
        edit: JSE.q('dialog#edit-dialog', this.#$root),
        delete: JSE.q('dialog#delete-dialog', this.#$root),
    };

    #dad = new DragAndDrop(JSE.qs('.note-list', this.#$root));

    #storage = new Storage();

    #dialogs = {
        add: new Dialog(this.#dialog.add),
        edit: new Dialog(this.#dialog.edit),
        delete: new Dialog(this.#dialog.delete),
    };

    constructor()
    {
        this.#dad.onDrop(() => this.#reorderList());
    }

    #emptyList()
    {
        JSE.qs('.note', this.#$list).forEach(obj => obj.remove());
    }

    #drawList()
    {
        let list = this.#storage.getObj(),
            keys = Object.keys(list);

        keys.forEach(key => {
            this.#$anchor.before(this.#$tpl.render({
                key: key,
                title: list[key]['title'] || key,
                color: list[key]['color'] || '#eee',
            }));
        });

        let c = JSE.q('article.note[data-key="'+this.#$list.dataset.note+'"]', this.#$list);
        if (c) {
            c.classList.add('selected');
        }

        keys.length > 0
            ? this.#$list.classList.remove('empty')
            : this.#$list.classList.add('empty');

        this.#dad.init(JSE.qs('article.note', this.#$list));
        JSE.qs('.select-menu', this.#$list).forEach(el => new SelectMenu(el));
    }

    #redrawList()
    {
        this.#emptyList();
        this.#drawList();

        this.#dialogs.edit.initActors();
        this.#dialogs.delete.initActors();
    }

    #reorderList()
    {
        const keys = [];
        JSE.qs('article.note').forEach(el => keys.push(el.dataset.key));
        this.#storage.reorder(keys);
    }

    #deleteNote()
    {
        this.#storage.delete(this.#storedKey);

        if (this.#$note && this.#$note.dataset.note === this.#storedKey) {
            globalThis.location = MAIN_URL;
        } else {
            this.#redrawList();
        }
    }

    #bufferKey(noteArea)
    {
        this.#storedKey = noteArea ? noteArea.dataset.key : null;
    }

    #resetFields(setting, dialog)
    {
        for (const prop in setting) {
            JSE.q(`input[name=${prop}]`, dialog).value = setting[prop];
        }
    }

    /**
     * run APP
     */
    run()
    {
        this.#drawList();
        this.#dialogs.add.initActors();
        this.#dialogs.edit.initActors();
        this.#dialogs.delete.initActors();

        // export
        JSE.ev('click', () => {
            FileExportImport.download(
                this.#storage.get(),
                'of-node-export-'+(new Date().toJSON().slice(0,10))+'.json',
                'application/json'
            );
        }, JSE.q('button.export', this.#$root));

        // import
        JSE.ev('click', () => {
            FileExportImport.upload(json => {
                this.#storage.merge(json);
                this.#redrawList();
            }, 'application/JSON');
        }, JSE.q('button.import', this.#$root));

        // reset add dialog
        JSE.ev('click',
            () => this.#resetFields({title:'', color:'#17a2b8'}, this.#dialog.add),
            JSE.q('.control button.add', this.#$root)
        );

        // initialize edit/delete button
        JSE.ev('click', ev => {
            const el = ev.target;

            if (el.closest('a.delete')) {
                this.#bufferKey(el.closest('article.note'));
            } else if (el.closest('a.edit')) {
                const json = this.#storage.getObj();
                this.#bufferKey(el.closest('article.note'));

                // reset edit dialog
                this.#resetFields({
                    title: json[this.#storedKey].title || this.#storedKey,
                    color: json[this.#storedKey].color || '#17a2b8'
                }, this.#dialog.edit);
            }
        }, this.#$list);

        // add note
        JSE.ev('submit', () => {
            const formData = new FormData(),
                url = JSE.q('button.primary', this.#dialog.add).dataset.url;
            formData.append('title', JSE.q('input[name=title]', this.#dialog.add).value);
            formData.append('color', JSE.q('input[name=color]', this.#dialog.add).value);

            fetch(this.#dialog.add.dataset.action, {
                method: "POST",
                headers: {"X-Requested-With": "XMLHttpRequest"},
                body: formData
            }).then((r) => {
                if (!r.ok) {
                    throw new Error(`Response status: ${r.status}`);
                }

                return r.json();
            }).then(d => {
                this.#storage.add(d.note, formData.get('title'), formData.get('color'));
                this.#redrawList();
                globalThis.location = url.replace('{note}', d.note);

            }).catch (() => {
                Bullhorn.show(__('There was a problem communicating with the server'));
            });
        }, JSE.q('form', this.#dialog.add));

        // finish edit
        JSE.ev('submit', () => {
            const json = this.#storage.getObj();
            json[this.#storedKey] = {
                title: JSE.q('input[name=title]', this.#dialog.edit).value || this.#storedKey,
                color: JSE.q('input[name=color]', this.#dialog.edit).value,
            };
            this.#storage.setObj(json);

            this.#redrawList();
        }, JSE.q('form', this.#dialog.edit));

        // delete
        JSE.ev('submit', () => this.#deleteNote(), JSE.q('form', this.#dialog.delete));
    }
}
