/**
 * cookies manager
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */

class Cookies
{
    set(name, value, days = null, path='/')
    {
        let set = [name + '=' + (value || '')],
            date = new Date();

        if (days !== null) {
            date.setTime(date.getTime() + (days*24*60*60*1000));
            set.push('expires=' + date.toUTCString());
        }

        set.push('path='+path);

        document.cookie = set.join('; ');
    }

    get(name)
    {
        let key = name + '=',
            ca = document.cookie.split(';');

        for(let i = 0, c; i < ca.length; i++) {
            c = ca[i];
            while (c.startsWith(' ')) {
                c = c.substring(1, c.length);
            }

            if (c.startsWith(key)) {
                return c.substring(key.length,c.length);
            }
        }

        return null;
    }

    erase(name)
    {
        document.cookie = name +'=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
}
