/**
 * thema chooser management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class ThemaChooser
{
    #body = JSE.q('body');

    #btn = JSE.q('.header-control button.theme-btn');

    #cookies = new Cookies();

    constructor() {
        JSE.ev('click', () => {
            this.#body.classList.toggle('dark');

            this.#saveInCookies('t', this.#body.classList.contains('dark') ? 'd' : 'l');
        }, this.#btn);
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
}