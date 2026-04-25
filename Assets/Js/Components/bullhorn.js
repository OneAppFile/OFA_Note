/**
 * bullhorn message alert.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Bullhorn {
    static #divider = 24; // px

    /**
     * close message box
     * @param {HTMLElement} obj
     * @param {function} cb
     */
    static #close(obj, cb) {
        cb();
        Bullhorn.#reposition(obj, Number.parseInt(obj.dataset.height));
        obj.remove();
    }

    /**
     * calculate new message position and move to new position
     * @param {HTMLElement} obj
     * @param {number} offset
     */
    static #reposition(obj, offset) {
        let top = Bullhorn.#divider;

        JSE.qs('.bullhorn-notice').forEach(el => {
            el.style.top = top+'px';

            if (el !== obj) {
                top += Number.parseInt(el.dataset.height, 10) + Bullhorn.#divider;
            }
        });
    }

    /**
     * draw and show message box
     * @param {string} note
     * @param {boolean} selfClosable
     * @param {number} showTime
     * @param {function|null} closeCallback
     */
    static show(note, selfClosable=true, showTime=5000, closeCallback=null) {
        let body = JSE.q('body'),
            top = Bullhorn.#divider,
            cb = typeof closeCallback === 'function' ? closeCallback : () => {};

        JSE.qs('.bullhorn-notice').forEach(obj => {
            top += Number.parseInt(JSE.style(obj).height, 10) + Bullhorn.#divider;
        });

        let obj = document.createElement("div");
        obj.classList.add('bullhorn-notice');
        obj.innerText = note;
        body.appendChild(obj);

        setTimeout(() => {
            obj.style.top = top+'px';
            obj.style.opacity = 1;
        }, 5);
        obj.dataset.height = Number.parseInt(JSE.style(obj).height, 10);

        if (selfClosable) {
            let timer = setTimeout(() => Bullhorn.#close(obj, cb), showTime);
            JSE.ev('click', () => {
                clearTimeout(timer);
                Bullhorn.#close(obj, cb);
            }, obj);
        } else {
            const c = document.createElement("i");
            c.classList.add('bullhorn-close');
            obj.prepend(c);
            JSE.ev('click', () => Bullhorn.#close(obj, cb), c)
        }
    }
}
