/**
 * select menu.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class SelectMenu {
    #el = null;

    constructor(el) {
        let tr;

        this.#el = el;
        if (this.#el) {
            this.#setClose();
            tr = JSE.q('a.menu-trigger', el);

            if (tr) {
                JSE.ev('click', () => el.classList.toggle('open'), tr);
            }
        }
    }

    #setClose()
    {
        JSE.ev('click', ev => {
            const obj = ev.target.closest('.select-menu'),
                cl = this.#el.classList;

            if (cl.contains('open') && !obj || obj !== this.#el) {
                cl.remove('open');
            }
        });
    }
}
