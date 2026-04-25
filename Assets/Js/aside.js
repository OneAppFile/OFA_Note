/**
 * aside management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Aside
{
    #body = JSE.q('body');

    #listMenu = JSE.q('.burger-menu.list');

    #settingMenu = JSE.q('.burger-menu.setting');

    #maxPossibleWidth = 700;

    /**
     * opening/closing of aside panel.
     * @param {string} asideClass
     */
    #togglePanel(asideClass)
    {
        const togglePanels = {'view-list': 'view-setting', 'view-setting' : 'view-list'};

        if (this.#body.classList.contains(asideClass)) {
            this.#body.classList.remove(asideClass);
        } else {
            this.#body.classList.add(asideClass);
            if (this.#body.offsetWidth < this.#maxPossibleWidth && togglePanels[asideClass] !== undefined) {
                this.#body.classList.remove(togglePanels[asideClass]);
            }
        }
    }

    constructor()
    {
        JSE.ev('click', () => this.#togglePanel('view-list'), this.#listMenu);
        JSE.ev('click', () => this.#togglePanel('view-setting'), this.#settingMenu);
    }
}
