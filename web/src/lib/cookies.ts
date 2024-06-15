const Cookie = () => {

    const read = (value: string) => {
        if (value[0] === '"') {
            value = value.slice(1, -1)
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    }

    const getCookie = (key: string) => {
        let cookies = document.cookie ? document.cookie.split('; ') : []
        let jar: {[k: string]: string} = {}
        for (var i = 0; i < cookies.length; i++) {
            var parts = cookies[i].split('=')
            var value = parts.slice(1).join('=')

            try {
                var found = decodeURIComponent(parts[0])
                if (!(found in jar)) {
                    jar[found] = read(value)
                }
                if (key === found) {
                    break
                }
            } catch {
                // Do nothing...
            }
        }

        return key ? jar[key] : jar
    }

    return Object.create({getCookie})
}

export default Cookie