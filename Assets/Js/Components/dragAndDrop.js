/**
 * drag and drop scripts to extend nativ dragAndDrop for touch devices.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class DragAndDrop {
    #containers = null;

    #elements = [];

    #onDrop = () => {};

    #dragging = null;

    #isTouchDevice = false;

    #timer;

    constructor(containers)
    {
        this.#containers = NodeList.prototype.isPrototypeOf(containers) ? containers : [containers];
        this.#containers.forEach(el => this.#initContainer(el));

        this.#isTouchDevice = ("ontouchstart" in globalThis || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
    }

    #initContainer(cont)
    {
        cont.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = this.#getDragAfterElement(cont, e.clientY);

            if (this.#dragging) {
                afterElement == null ? cont.appendChild(this.#dragging) : afterElement.before(this.#dragging);
            }
        });
    }

    onDrop(callback)
    {
        if (typeof callback === 'function') {
            this.#onDrop = callback;
        }
    }

    #getDragAfterElement(cont, y)
    {
        return [...cont.querySelectorAll('[draggable=true]:not(.dragging)')]
            .reduce((closest, child) => {
                const box = child.getBoundingClientRect(),
                    offset = y - box.top - box.height / 2;

                return offset < 0 && offset > closest.offset ? {offset: offset, element: child} : closest;
            }, {offset: Number.NEGATIVE_INFINITY}).element;
    }

    #initClickElement(el)
    {
        el.setAttribute('draggable', 'true');

        el.addEventListener('dragstart', () => {
            this.#dragging = el;
            el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            this.#dragging = null;
            this.#onDrop(el);
        });
    }

    #setDraggable()
    {
        this.#elements.forEach(el => el.setAttribute('draggable', 'true'));
    }

    #removeDraggable()
    {
        this.#elements.forEach(el => el.removeAttribute('draggable'));
    }

    #initTouchElement(el)
    {
        this.#elements.push(el);

        el.addEventListener('touchend', () => {
            clearTimeout(this.#timer);

            setTimeout(() => {
                if (this.#dragging) {
                    this.#removeDraggable();
                    el.classList.remove('dragging');
                    this.#dragging = null;
                    this.#onDrop(el);
                }
            }, 205);
        });

        el.addEventListener('touchstart', () => {
            this.#timer = setTimeout(e => {
                this.#dragging = el;
                this.#setDraggable();
                el.classList.add('dragging');

                if (e?.cancelable) {
                    e.preventDefault();
                }
            }, 200);
        });

        el.addEventListener('touchmove', e => {
            if (this.#dragging) {
                const touch = e.touches[0],
                    cont = this.#getClosestContainer(document.elementFromPoint(touch.clientX, touch.clientY));

                if (cont) {
                    const afterElement = this.#getDragAfterElement(cont, touch.clientY);

                    afterElement
                        ? cont.insertBefore(this.#dragging, afterElement)
                        : cont.appendChild(this.#dragging);
                }

                e.preventDefault();
            }
        });
    }

    #getClosestContainer(el)
    {
        for(let cont of this.#containers) {
            while (el) {
                if (el === cont || cont.contains(el)) {
                    return cont;
                }

                el = el.parentNode;
            }
        }

        return null;
    }

    init(elements)
    {
        elements.forEach(el => {
            if (!el.dataset.draggable) {
                el.dataset.draggable = 'true';
                this.#isTouchDevice ? this.#initTouchElement(el) : this.#initClickElement(el);
            }
        });
    }
}
