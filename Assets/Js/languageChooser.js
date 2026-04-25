/**
 * language chooser management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class LanguageChooser
{
    #btn = JSE.q('button.lang-btn');

    #chooser = JSE.q('.lang-chooser ul');

    #choosers = JSE.qs('button', this.#chooser);

    #cookies = new Cookies();

    constructor() {
        JSE.ev('click', () => this.#chooser.toggleAttribute('hidden'), this.#btn);

        this.#choosers.forEach(o => {
            JSE.ev('click', () => {
                this.#saveInCookies('l', o.dataset.lang);

                this.#chooser.setAttribute('hidden', 'true');
                setTimeout(() => location.reload(), 300);
            }, o);
        });

        this.#setClose();
    }

    #saveInCookies(key, value)
    {
        let v = {};

        try {
            v = JSON.parse(this.#cookies.get('setting') || '{}');
        } catch {}

        v[key] = value;
        this.#cookies.set('setting', JSON.stringify(v));
    }

    #setClose()
    {
        JSE.ev('click', ev => {
            const obj = ev.target.closest('.lang-chooser');

            if (!obj) {
                this.#chooser.setAttribute('hidden', 'true');
            }
        });
    }
}
