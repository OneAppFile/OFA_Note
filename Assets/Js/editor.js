/**
 * edit app page.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Editor {
    #root = JSE.q('main');

    #setting = JSE.q('.note-setting', this.#root);

    #area = {
        icons: JSE.q('header .sync'),
        settings: JSE.qs('.setting-element', this.#setting),
        noteProtection: JSE.q('.note-protection', this.#root),
    };

    #dialog = {
        password: JSE.q('dialog#password-dialog'),
        addPassword: JSE.q('dialog#add-password-dialog'),
        removePassword: JSE.q('dialog#remove-password-dialog'),
    };

    #ipt = {
        lock: JSE.q('input[name="lock"]', this.#setting),
        passHash: JSE.q('input[name="proof"]', this.#setting),
        note: JSE.q('.note', this.#root),
    };

    #btn = {
        print: JSE.q('.print-btn', this.#root),
        share: JSE.q('.share-btn', this.#root),
        export: JSE.q('.export-btn', this.#root),
        import: JSE.q('.import-btn', this.#root),
    };

    #noteTemplate = JSE.q('.hidden-part template.note-content');

    #viewer = this.#noteTemplate ? new Viewer(this.#noteTemplate) : null;

    #cryptography = new Cryptography();

    #passHash = this.#ipt.passHash.value;

    #sendDelay = 1000;

    #timer = null;

    #password = '';

    #saveUrl = this.#ipt.note ? this.#ipt.note.dataset.action : '';

    #storage = new Storage();

    constructor()
    {
        // share btn
        if (navigator.canShare && this.#btn.share) {
            this.#btn.share.removeAttribute('hidden');
        }
    }

    initEditor()
    {
        if (this.#viewer) {
            // init content
            if (this.#ipt.lock.value === 'true') {
                this.#dialog.password.showModal();
            } else {
                this.#setContent(this.#viewer.render({}).textContent);
                this.#initEditor();
            }

            // add note to storage
            if (this.#ipt.note.dataset.note && !this.#storage.exists(this.#ipt.note.dataset.note)) {
                this.#storage.add(this.#ipt.note.dataset.note, null, null);
            }
        }
    }

    #save()
    {
        if (this.#isPassCorrect()) {
            this.#getFormData()
                .then((formData) => {
                    fetch(this.#saveUrl, {
                        method: 'POST',
                        headers: {'X-Requested-With': 'XMLHttpRequest'},
                        body: formData
                    }).then(response => this.#viewStatus(response.status === 200 ? 'sent' : 'error')
                    ).catch(() => this.#viewStatus('error'));
                });
        } else {
            Bullhorn.show(__('It is not possible to save, a false password has been entered', false));
        }
    }

    /**
     * return true if password not set or given password is correct.
     * @returns {boolean}
     */
    #isPassCorrect(pass = null)
    {
        pass = pass || this.#password;
        return pass === '' || this.#cryptography.getHash(pass) === this.#passHash;
    }

    #getFormData()
    {
        return (async () => {
            const formData = new FormData();

            formData.append('text', await this.#fetchContent());
            this.#area.settings.forEach(f => formData.append(f.name, f.value));

            return formData;
        })();
    }

    /**
     * return filtered content.
     * @returns {Promise<unknown>|string}
     */
    #fetchContent()
    {
        let c = this.#getContent();

        if (this.#ipt.lock.value === 'true') {
            return this.#cryptography.encrypt(c, this.#password);
        } else {
            return c;
        }
    }

    /**
     * fix editor content.
     * @returns {string}
     */
    #getContent()
    {
        let p = document.createElement('p'),
            text;

        p.innerHTML = this.#ipt.note.innerHTML
            .replaceAll(/\n/ig, '')
            .replaceAll(/<br\s?\/>/ig, '<br>')
            .replaceAll(/<div><span><br><\/span><\/div>/ig, '<br>')
            .replaceAll(/<\/span><br><\/div>/ig, '</span></div>')

            .replaceAll(/<div><br><\/div>/ig, '<br>')
            .replaceAll(/<div[^>]+><br><\/div>/ig, '<br>')
            .replaceAll(/<div>/ig, '<br>')
            .replaceAll(/<div[^>]+>/ig, '<br>')
            .replaceAll(/<\/div>/ig, '')

            .replaceAll(/<p><br><\/p>/ig, '<br>')
            .replaceAll(/<p[^>]+><br><\/p>/ig, '<br>')
            .replaceAll(/<p>/ig, '<br>')
            .replaceAll(/<p[^>]+>/ig, '<br>')
            .replaceAll(/<\/p>/ig, '')

            .replaceAll(/<br>/ig, "<br>\n");

        text = p.innerText;

        return text === '\n' ? '' : text;
    }

    #initEditor()
    {
        this.#ipt.note.setAttribute('contenteditable', true);
        this.#ipt.note.focus();

        JSE.ev('input', () => this.#send(), this.#ipt.note);

        JSE.ev('keydown', (ev) => {
            if (ev.key.toLowerCase() === 'tab' || ev.ctrlKey === 9) { // Tab
                ev.preventDefault();
                this.#addTextToEditor('    ');
            }
        }, this.#ipt.note);
    }

    #setContent(txt)
    {
        this.#ipt.note.innerHTML = this.#filterContent(txt);
    }

    #initSetting()
    {
        this.#area.settings.forEach(f => {
            JSE.ev('change', () => {
                let cl = this.#ipt.note.classList,
                    opt = f.options,
                    name = f.name;

                if (['font', 'bg', 'size'].includes(name)) {
                    for (let i = 0, c = opt.length; i < c; i++) {
                        cl.remove(opt[i].value);
                    }
                    cl.add(f.value);
                } else if (['spellcheck'].includes(name)) {
                    this.#ipt.note.spellcheck = f.value === 'true';
                }

                // save doc with setting
                this.#save();
            }, f);
        });
    }

    #send()
    {
        clearTimeout(this.#timer);

        this.#viewStatus('edit');
        this.#timer = setTimeout(() => this.#save(), this.#sendDelay);
    }

    /**
     * view transfer status.
     * @param {string} status
     */
    #viewStatus(status)
    {
        let cl = this.#area.icons.classList,
            stats = ['error', 'edit', 'sent'];
        stats.forEach(o => cl.remove(o));

        if (stats.includes(status)) {
            cl.add(status);
        }
        if (status === 'sent') {
            setTimeout(() => cl.remove('sent'), 2000);
        }
    }

    #filterContent(txt)
    {
        return txt.toString()
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll("\t", '    ')
            .replaceAll("\n", '<br>');
    }

    #fromClipboard(ev)
    {
        return new Promise(function(resolve, reject) {
            let obj = ev.clipboardData || globalThis.clipboardData || undefined;

            if (obj !== undefined) {
                resolve(obj.getData('text/plain'));
            } else if (navigator.clipboard?.readText === undefined) {
                reject(new Error('Failed to read from clipboard.'));
            } else {
                navigator.clipboard.readText()
                    .then(text => resolve(text))
                    .catch(() => reject(new Error('Failed to read from clipboard.')));
            }
        });
    }

    #onPaste(ev)
    {
        this.#fromClipboard(ev)
            .then(txt => this.#addTextToEditor(txt))
            .catch(() => {
                Bullhorn.show(__('An error occurred on content paste clipboard data'));
            });
    }

    #addTextToEditor(txt)
    {
        let selection = document.getSelection(),
            range,
            html = document.createElement('span');

        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
            range.deleteContents();
        } else {
            range = new Range();
            range.setStart(this.#ipt.note, 0);
            range.setEnd(this.#ipt.note, 0);
            selection.addRange(range);
        }

        html.innerHTML = this.#filterContent(txt);
        range.collapse(true);
        range.insertNode(html);

        selection.collapseToEnd();
        this.#ipt.note.dispatchEvent(new Event("input"));
    }

    #pageShare()
    {
        if (navigator.canShare) {
            navigator
                .share({title: document.title, url: globalThis.location.href})
                .then(() => {})
                .catch(() => Bullhorn.show(__('An error occurred while trying to share content')));
        }
    }

    /**
     * init add password dialog.
     */
    #initAddPassDialog()
    {
        const pass1 = JSE.q('input#dialog-set-pass', this.#dialog.addPassword),
            pass2 = JSE.q('input#dialog-repeat-pass', this.#dialog.addPassword),
            err = JSE.q('.error-msg', this.#dialog.addPassword),
            cl = this.#area.noteProtection.classList;

        JSE.ev('submit', () => {
            const p1 = pass1.value.toString().trim(),
                p2 = pass2.value;

            if (p1 === '') {
                err.innerText = __('Password was not specified');
            } else if (p1 === p2) {
                this.#password = p1;
                this.#passHash = this.#cryptography.getHash(this.#password);

                this.#ipt.lock.value = 'true';
                this.#ipt.passHash.value = this.#passHash;

                cl.add('locked');
                cl.remove('unlocked');

                this.#ipt.note.dispatchEvent(new Event("input"));
                this.#dialog.addPassword.close();
            } else {
                err.innerText = __('The passwords do not match');
            }
        }, JSE.q('form', this.#dialog.addPassword));
    }

    /**
     * initialise remove password dialog.
     */
    #initRemovePassDialog()
    {
        const pass1 = JSE.q('input#dialog-delete-pass', this.#dialog.removePassword),
            err = JSE.q('.error-msg', this.#dialog.removePassword),
            cl = this.#area.noteProtection.classList;

        JSE.ev('submit', () => {
            const p1 = pass1.value.toString().trim();

            if (p1 === '') {
                err.innerText = __('Password was not specified');
            } else if (p1 && this.#isPassCorrect(p1)) {
                this.#password = '';
                this.#passHash = '';

                this.#ipt.lock.value = 'false';
                this.#ipt.passHash.value = this.#passHash;

                cl.add('unlocked');
                cl.remove('locked');

                this.#ipt.note.dispatchEvent(new Event("input"));
                this.#dialog.removePassword.close();
            } else {
                err.innerText = __('The given password seems to be incorrect');
            }
        }, JSE.q('form', this.#dialog.removePassword));
    }

    /**
     * initialise password dialog.
     */
    #initPassDialog()
    {
        const pass1 = JSE.q('input#dialog-get-pass', this.#dialog.password),
            err = JSE.q('.error-msg', this.#dialog.password);

        JSE.ev('submit', ev => {
            const p1 = pass1.value.toString().trim();

            ev.preventDefault();

            if (p1 === '') {
                err.innerText = __('Password was not specified');
            } else if (p1 && this.#isPassCorrect(p1)) {
                this.#password = p1;

                this.#cryptography
                    .decrypt(this.#viewer.render({}).textContent, this.#password)
                    .then(c => this.#setContent(c));
                this.#initEditor();

                this.#dialog.password.close();
            } else {
                err.innerText = __('The given password seems to be incorrect');
            }
        }, JSE.q('form', this.#dialog.password));
    }

    run()
    {
        if (!this.#viewer) {
            return;
        }

        this.#initSetting();

        this.#initAddPassDialog();
        this.#initRemovePassDialog();
        this.#initPassDialog();

        // lock
        JSE.ev('click', () => {
            JSE.q('.error-msg', this.#dialog.addPassword).innerText = '';
            this.#dialog.addPassword.showModal();
        }, JSE.q('.lock-btn', this.#root));
        // unlock
        JSE.ev('click', () => {
            JSE.q('.error-msg', this.#dialog.removePassword).innerText = '';
            this.#dialog.removePassword.showModal();
        }, JSE.q('.unlock-btn', this.#root));

        // on paste
        JSE.ev('paste', ev => {
            ev.preventDefault();
            this.#onPaste(ev);
        }, this.#ipt.note);

        // print
        JSE.ev('click', () => print(), this.#btn.print);

        // share
        JSE.ev('click', () => this.#pageShare(), this.#btn.share);

        // export
        JSE.ev('click', () => {
            let title = this.#ipt.note.dataset.note+'-export-'+(new Date().toJSON().slice(0,10))+'.txt';

            FileExportImport.download(this.#getContent(), title, 'text/plain');
        }, this.#btn.export);

        // import
        JSE.ev('click', () => {
            FileExportImport.upload(txt => this.#addTextToEditor(txt), 'text/plain');
        }, this.#btn.import);
    }
}
