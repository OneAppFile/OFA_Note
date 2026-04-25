/**
 * viewer elemnent to manage template elements.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Viewer {
    #node;

    constructor(tpl, options) {
        if (tpl) {
            this.#node = tpl.innerHTML;
            tpl.remove();
        }
    }

    /**
     * secure html entities.
     *
     * @param {string} text
     */
    #escape(text) {
        let escapeSymbole = {'&': '&amp;', '<': '&lt;', '>': '&gt;'};

        return text.toString().replaceAll(/[&<>()]/g, tag => escapeSymbole[tag] || tag);
    }

    /**
     * return template with replaced values.
     *
     * Example:
     *      Template: '<div>${name}</div>'
     *      Values: {name: 'John Doe'}
     *      Result: '<div>John Doe</div>'
     *
     * @param {object} params
     * @returns {DocumentFragment}
     */
    render(params = {}) {
        const template = this.#node.toString().trim(),
            render = new Function(...Object.keys(params), `return \`${template}\``),
            node = document.createElement('template');

        node.innerHTML = render(...Object.values(params).map(this.#escape));
        return node.content;
    }
}
