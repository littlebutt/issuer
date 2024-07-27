// @ts-nocheck
import { marked } from "marked"

type Marked = {
	parse: (src: string) => ReactNode
}

const useMarked: () => Marked = () => {
	let renderer = new marked.Renderer()
	renderer.image = (href: string, title: string, text: string) => {
		return `<img src="${href}" alt="${text}" title="${title}" />`
	}
	marked.use({
		renderer
	})

	const parse = (src: string) => {
		let markedText = marked.parse(src) as string
		return <div dangerouslySetInnerHTML={{ __html: markedText }}></div>
	}

	return Object.create({ parse })
}

export default useMarked
