import { Controller } from "@hotwired/stimulus"
import { basicSetup, EditorView } from "codemirror"
import { EditorState, Prec } from "@codemirror/state"
import { liquid } from "@codemirror/lang-liquid"
import { html } from "@codemirror/lang-html"
import { markdown } from "@codemirror/lang-markdown"
import { yaml } from "@codemirror/lang-yaml"
import { json } from "@codemirror/lang-json"

const LANGUAGES = { liquid, html, markdown, yaml, json }

// The code editor (component.rb): CodeMirror on the hidden input's value,
// which it keeps up to date.
//
// For other controllers working with its text (the Liquid field), find it with
// application.getControllerForElementAndIdentifier(element, "entdec--code-editor")
// once it's ready: `ready` is true, or wait for its connect event.
//
// Events, on its element:
//   entdec--code-editor:connect  { editor }          ready
//   entdec--code-editor:change   { value, typed }    the text changed; typed when by typing
//   entdec--code-editor:blur     { editor }
//
// The text around the caret, on its line, and changing it:
//   textAround()                       { before, after }
//   replaceAround(start, end, text, { caret })
//                                      replaces start…end of before + after; caret is
//                                      where it goes after, from start (the text's end)
//   insert(text)                       at the caret, or over the selection
//   caretRect()                        where the caret is in the viewport
//
// And:
//   value, value = text, focus()
//   onKeydown(handler)                 handler(event) before the editor's own keys; it
//                                      returns true when it took the key. Returns a function
//                                      that removes it.
export default class extends Controller {
  static targets = ["input"]
  static values = { lang: { type: String, default: "liquid" }, height: { type: String, default: "8rem" }, readOnly: Boolean }

  connect() {
    this.keyHandlers = []
    const language = LANGUAGES[this.langValue] || liquid
    this.view = new EditorView({
      parent: this.element,
      doc: this.inputTarget.value,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        language(),
        EditorState.readOnly.of(this.readOnlyValue),
        EditorView.theme({
          "&": { height: this.heightValue, maxHeight: this.heightValue },
          ".cm-gutter, .cm-content": { minHeight: this.heightValue },
          ".cm-scroller": { overflow: "auto" },
          "&.cm-focused": { outline: "none" }
        }),
        Prec.highest(
          EditorView.domEventHandlers({
            keydown: (event) => this.keyHandlers.some((handler) => handler(event)),
            blur: () => this.dispatch("blur", { detail: { editor: this } })
          })
        ),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return

          this.inputTarget.value = this.value
          const typed = update.transactions.some((transaction) => transaction.isUserEvent("input.type"))
          this.dispatch("change", { detail: { value: this.value, typed } })
        })
      ]
    })
    this.ready = true
    this.dispatch("connect", { detail: { editor: this } })
  }

  disconnect() {
    this.ready = false
    this.view?.destroy()
  }

  get value() {
    return this.view.state.doc.toString()
  }

  set value(text) {
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: text } })
  }

  focus() {
    this.view.focus()
  }

  textAround() {
    const { line, offset } = this.caret()
    return { before: line.text.slice(0, offset), after: line.text.slice(offset) }
  }

  replaceAround(start, end, text, { caret = text.length } = {}) {
    const { from } = this.caret().line
    this.view.dispatch({ changes: { from: from + start, to: from + end, insert: text }, selection: { anchor: from + start + caret }, userEvent: "input.complete" })
  }

  insert(text) {
    this.focus()
    const { from, to } = this.view.state.selection.main
    this.view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, userEvent: "input" })
  }

  caretRect() {
    return this.view.coordsAtPos(this.view.state.selection.main.head) || this.view.dom.getBoundingClientRect()
  }

  onKeydown(handler) {
    this.keyHandlers.push(handler)
    return () => (this.keyHandlers = this.keyHandlers.filter((other) => other !== handler))
  }

  caret() {
    const head = this.view.state.selection.main.head
    const line = this.view.state.doc.lineAt(head)
    return { line, offset: head - line.from }
  }
}
