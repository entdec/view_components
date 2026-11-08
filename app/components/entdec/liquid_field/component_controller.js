import { Controller } from "@hotwired/stimulus"
import { Variables } from "tess_edit/core/variables"
import { VariableMenu, inputAdapter, suggestIn } from "tess_edit/ui/variable_menu"

// The Liquid field (component.rb): TessEdit's variable menu on the input,
// textarea or code editor (EntDec::CodeEditor, through its API) inside, with
// the variables from the url, which may change. The menu shows in a layer
// over the page, so a card around the field doesn't cut it off, below the
// field or above it when there's no room.
export default class extends Controller {
  static values = { url: String }

  connect() {
    const variables = new Map()
    const urlOf = () => this.urlValue
    this.layer = document.createElement("div")
    this.layer.className = "entdec-liquid-field__layer"
    document.body.append(this.layer)
    // The "editor" the menu works in: its variables, and where it's shown
    this.menu = new VariableMenu({
      root: this.layer,
      get variables() {
        const url = urlOf()
        if (!variables.has(url)) variables.set(url, new Variables(url))
        return variables.get(url)
      }
    })

    // It stays where it was put: the page scrolling closes it (not the field
    // or the menu's own list)
    this.close = (event) => {
      const target = event?.target
      if (target instanceof Node && (this.field?.contains(target) || this.layer.contains(target))) return
      this.menu.close()
    }
    window.addEventListener("scroll", this.close, true)
    window.addEventListener("resize", this.close)

    const code = this.element.querySelector("[data-controller~='entdec--code-editor']")
    if (code) {
      this.whenEditor(code, (editor) => this.attachEditor(editor))
    } else {
      this.field = this.element.querySelector("textarea, input:not([type=hidden]):not([type=checkbox]):not([type=radio])")
      if (!this.field) return

      this.adapter = inputAdapter(this.field)
      suggestIn(this.menu, this.field, this.adapter)
    }
  }

  disconnect() {
    this.menu?.close()
    this.layer?.remove()
    window.removeEventListener("scroll", this.close, true)
    window.removeEventListener("resize", this.close)
  }

  browse(event) {
    if (this.adapter) this.menu.browse(this.adapter, event.currentTarget)
  }

  // The code editor connects before or after this one
  whenEditor(element, callback) {
    const editor = this.application.getControllerForElementAndIdentifier(element, "entdec--code-editor")
    if (editor?.ready) return callback(editor)

    element.addEventListener("entdec--code-editor:connect", (event) => callback(event.detail.editor), { once: true })
  }

  attachEditor(editor) {
    this.field = editor.element
    this.adapter = codeEditorAdapter(editor)
    editor.element.addEventListener("entdec--code-editor:change", (event) => event.detail.typed && this.menu.suggest(this.adapter))
    editor.element.addEventListener("entdec--code-editor:blur", () => !this.menu.state?.browse && this.menu.close())
    editor.onKeydown((event) => this.menu.key(event))
  }
}

// TessEdit's adapter (see its variable_menu.js) for the code editor: the
// text of the caret's line before and after it
function codeEditorAdapter(editor) {
  return {
    mode: "output",
    scope: [],
    before: () => editor.textAround().before,
    after: () => editor.textAround().after,
    replace(start, end, text) {
      // The Liquid editor closes {{ with }} as it's typed: "{{ order.number }}"
      // rather than "{{ order.number}}", with the caret after it
      const { before, after } = editor.textAround()
      const closed = !text.endsWith(".") && `${before}${after}`.startsWith("}}", end)
      editor.replaceAround(start, end, closed ? `${text} ` : text, { caret: text.length + (closed ? 3 : 0) })
    },
    insert: (text) => editor.insert(text),
    rect: () => editor.caretRect()
  }
}
