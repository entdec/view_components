import { Controller } from "@hotwired/stimulus"

// The pill select (component.rb): the native select's chosen option on the
// pill, and its options in a popover to choose from. The select stays the
// source of truth: choosing sets it and fires its change event, and when
// something else changes its options (a chained select), the pill follows.
export default class extends Controller {
  static targets = ["select", "pill", "text", "popover", "search", "list"]
  static values = { searchFrom: { type: Number, default: 8 } }

  connect() {
    this.renderPill = this.renderPill.bind(this)
    this.closeOutside = (event) => {
      if (!this.element.contains(event.target)) this.close()
    }
    this.selectTarget.addEventListener("change", this.renderPill)
    this.observer = new MutationObserver(this.renderPill)
    this.observer.observe(this.selectTarget, { childList: true, attributes: true, attributeFilter: ["disabled"] })
    this.renderPill()
  }

  disconnect() {
    this.selectTarget.removeEventListener("change", this.renderPill)
    this.observer.disconnect()
    document.removeEventListener("click", this.closeOutside)
  }

  renderPill() {
    this.textTarget.textContent = this.selectTarget.selectedOptions[0]?.text || "—"
    this.pillTarget.disabled = this.selectTarget.disabled || this.selectTarget.options.length === 0
  }

  toggle() {
    this.popoverTarget.hidden ? this.open() : this.close()
  }

  open() {
    this.renderOptions()
    const searchable = this.selectTarget.options.length >= this.searchFromValue
    this.searchTarget.hidden = !searchable
    this.searchTarget.value = ""
    this.popoverTarget.hidden = false
    this.pillTarget.setAttribute("aria-expanded", "true")
    this.highlight(this.items.find((item) => item.getAttribute("aria-selected") === "true") || this.items[0])
    ;(searchable ? this.searchTarget : this.listTarget).focus()
    document.addEventListener("click", this.closeOutside)
  }

  close() {
    if (this.popoverTarget.hidden) return

    this.popoverTarget.hidden = true
    this.pillTarget.setAttribute("aria-expanded", "false")
    document.removeEventListener("click", this.closeOutside)
  }

  cancel() {
    this.close()
    this.pillTarget.focus()
  }

  renderOptions() {
    this.listTarget.replaceChildren(
      ...Array.from(this.selectTarget.options).map((option) => {
        const item = document.createElement("li")
        item.className = "entdec-pill-select__option"
        item.setAttribute("role", "option")
        item.setAttribute("aria-selected", option.selected)
        item.dataset.value = option.value

        const check = document.createElement("span")
        check.className = "entdec-pill-select__check"
        check.textContent = option.selected ? "✓" : ""
        const text = document.createElement("span")
        text.textContent = option.text
        item.append(check, text)

        item.addEventListener("click", () => this.choose(option.value))
        item.addEventListener("mouseenter", () => this.highlight(item))
        return item
      })
    )
  }

  filter() {
    const query = this.searchTarget.value.toLowerCase()
    this.items.forEach((item) => (item.hidden = !item.textContent.toLowerCase().includes(query)))
    this.highlight(this.visibleItems[0])
  }

  keydown(event) {
    if (this.popoverTarget.hidden) {
      if (event.key === "ArrowDown" && event.target === this.pillTarget) {
        event.preventDefault()
        this.open()
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        const items = this.visibleItems
        const index = items.indexOf(this.highlighted) + (event.key === "ArrowDown" ? 1 : -1)
        this.highlight(items[Math.max(0, Math.min(items.length - 1, index))])
        break
      }
      case "Enter":
        event.preventDefault()
        if (this.highlighted) this.choose(this.highlighted.dataset.value)
        break
      case "Escape":
        event.preventDefault()
        this.cancel()
        break
      case "Tab":
        this.close()
        break
    }
  }

  choose(value) {
    if (this.selectTarget.value !== value) {
      this.selectTarget.value = value
      this.selectTarget.dispatchEvent(new Event("change", { bubbles: true }))
    }
    this.renderPill()
    this.cancel()
  }

  highlight(item) {
    this.items.forEach((other) => other.classList.toggle("entdec-pill-select__option--highlighted", other === item))
    this.highlighted = item
    item?.scrollIntoView({ block: "nearest" })
  }

  get items() {
    return Array.from(this.listTarget.children)
  }

  get visibleItems() {
    return this.items.filter((item) => !item.hidden)
  }
}
