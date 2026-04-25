/**
 * localstorage management.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Storage
{
    #key = 'note';

    get()
    {
        return localStorage.getItem(this.#key);
    }

    set(value)
    {
        return localStorage.setItem(this.#key, value);
    }

    /**
     * read list from localstorage
     */
    getObj()
    {
        try {
            return JSON.parse(this.get()) || {};
        } catch {
            return {};
        }
    }

    /**
     * read list from localstorage
     */
    setObj(value)
    {
        this.set(JSON.stringify(value));
    }

    /**
     * merge notes object to exists list.
     * @param {object} obj
     */
    merge(obj)
    {
        let o = this.getObj();

        Object.keys(obj).forEach(key => o[key] = this.#getNoteObj(key, obj[key]['title'] || null, obj[key]['color'] || null));
        this.setObj(o);
    }

    /**
     * reorder stored note list.
     * @param {array} keys
     */
    reorder(keys)
    {
        const o = this.getObj();
        let ord = {};

        keys.forEach(key => ord[key] = this.#getNoteObj(key, o[key]['title'] || null, o[key]['color'] || null));
        this.setObj(ord);
    }

    exists(key)
    {
        return this.getObj()[key] !== undefined;
    }

    add(key, title, color)
    {
        const o = this.getObj();

        o[key] = this.#getNoteObj(key, title || null, color || null);
        this.setObj(o);
    }

    delete(key)
    {
        const o = this.getObj();

        if (key && o[key] !== undefined) {
            delete o[key];
            this.setObj(o);
        }
    }

    #getNoteObj(key, title, color)
    {
        return {title: title || key, color: color || '#eee'};
    }
}
