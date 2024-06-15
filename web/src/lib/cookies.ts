// copy from js-cookie
const Cookie = () => {

    const read = (value: string) => {
        if (value[0] === '"') {
            value = value.slice(1, -1)
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    }

    const write = (value: string) => {
        return encodeURIComponent(value).replace(
            /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
            decodeURIComponent
        )
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

    const setCookie = (key: string, value: string, attributes: {[k: string]: any}) => {
        if (typeof document === 'undefined') {
            return
          }
      
          if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
          }
          if (attributes.expires) {
            attributes.expires = attributes.expires.toUTCString()
          }
      
          key = encodeURIComponent(key)
            .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
            .replace(/[()]/g, escape)
      
          let stringifiedAttributes = ''
          for (let attributeName in attributes) {
            if (!attributes[attributeName]) {
              continue
            }
      
            stringifiedAttributes += '; ' + attributeName
      
            if (attributes[attributeName] === true) {
              continue
            }
      
            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            stringifiedAttributes += '=' + attributes[attributeName].split(';')[0]
          }
      
          return (document.cookie =
            key + '=' + write(value) + stringifiedAttributes)
    }

    return Object.create({getCookie, setCookie})
}

export default Cookie