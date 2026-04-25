/**
 * dialog scripts.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Dialog {
    #id = null;

    #element = null;

    #closeBtns = [];

    #openBtns = [];

    constructor(element) {
        this.#element = element;
        this.#id = element.getAttribute('id');

        if (this.#element.getAttribute('closedby') === 'any') {
            JSE.ev('click', ev => {
                const r = this.#element.getBoundingClientRect();

                if (r.top > ev.clientY || ev.clientY > r.top + r.height || r.left > ev.clientX || ev.clientX > r.left + r.width) {
                    this.close(ev);
                }
            }, this.#element);
        }
    }

    /**
     * init actors.
     */
    initActors()
    {
        const btns = JSE.qs('[commandfor='+this.#id+']');

        // btns auf existenz prüfen.
        btns.forEach(btn => {
            if (btn.getAttribute('command') === 'show-modal') {
                this.#addOpenBtn(btn);
            }
            if (btn.getAttribute('command') === 'close') {
                this.#addCloseBtn(btn);
            }
        });
    }

    #addOpenBtn(btn)
    {
        if (!this.#openBtns.includes(btn)) {
            this.#openBtns.push(btn);
            JSE.ev('click', ev => this.show(ev), btn);
        }
    }

    #addCloseBtn(btn)
    {
        if (!this.#closeBtns.includes(btn)) {
            this.#closeBtns.push(btn);
            JSE.ev('click', ev => this.close(ev), btn);
        }
    }

    close() {
        if (this.#element.getAttribute('open')) {
            this.#element.classList.add('closing');

            setTimeout(() => {
                this.#element.classList.remove('closing');
                this.#element.close();

                this.#openBtns.forEach(el => {
                    el.setAttribute('aria-expanded', 'false');
                });
                this.#closeBtns.forEach(el => {
                    el.setAttribute('aria-expanded', 'false');
                });
            }, 200);
        }
    }

    show() {
        if (!this.#element.getAttribute('open')) {
            this.#element.showModal();
            this.#element.setAttribute('open', 'true');

            this.#openBtns.forEach(el => {
                el.setAttribute('aria-expanded', 'true');
            });
            this.#closeBtns.forEach(el => {
                el.setAttribute('aria-expanded', 'true');
            });
        }
    }
}
