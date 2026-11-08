import { Controller } from "@hotwired/stimulus"

// The variable picker (component.rb): Liquidum's variables a level at a
// time, from the url's endpoint. A variable with variables of its own (a
// drop, not a list of them) opens them; the others are chosen. The trail
// above them goes back up.
export default class extends Controller {
  static targets = ["input", "pill", "text", "popover", "trail", "search", "list"]
  static values = { url: String }

  connect() {
    this.closeOutside = (event) => {
      if (!this.element.contains(event.target)) this.close()
    }
  }

  disconnect() {
    document.removeEventListener("click", this.closeOutside)
  }

  toggle() {
    this.popoverTarget.hidden ? this.open() : this.close()
  }

  open() {
    this.popoverTarget.hidden = false
    this.pillTarget.setAttribute("aria-expanded", "true")
    document.addEventListener("click", this.closeOutside)
    this.go(this.chosenTrail())
  }

  // Where the chosen variable is: its path and the labels on the pill
  chosenTrail() {
    const names = this.inputTarget.value.split(".").filter(Boolean).slice(0, -1)
    const labels = this.textTarget.textContent.split(" › ")
    return names.map((name, index) => ({ name, label: labels[index] || name }))
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

  // trail: the variables gone into, [{name, label}]
  async go(trail) {
    this.trail = trail
    this.renderTrail()
    this.searchTarget.value = ""
    this.listTarget.replaceChildren()

    const path = trail.map((step) => step.name).join(".")
    const url = new URL(this.urlValue, window.location.href)
    url.searchParams.set("path", path)
    const response = await fetch(url, { headers: { Accept: "application/json" } })
    if (!response.ok || this.trail !== trail) return

    const { variables } = await response.json()
    this.renderOptions(variables)
    this.searchTarget.hidden = variables.length < 8
    ;(this.searchTarget.hidden ? this.listTarget : this.searchTarget).focus()
  }

  renderTrail() {
    const steps = [{ label: this.trailTarget.dataset.root || "{ }" }, ...this.trail]
    this.trailTarget.replaceChildren(
      ...steps.flatMap((step, index) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "entdec-variable-picker__step"
        button.textContent = step.label
        button.addEventListener("click", (event) => {
          event.stopPropagation()
          this.go(this.trail.slice(0, index))
        })
        if (index === 0) return [button]

        const separator = document.createElement("span")
        separator.textContent = "›"
        return [separator, button]
      })
    )
  }

  renderOptions(variables) {
    const chosen = this.inputTarget.value
    const path = this.trail.map((step) => step.name)
    this.listTarget.replaceChildren(
      ...variables.map((variable) => {
        const opens = variable.children && !variable.collection
        const value = [...path, variable.name].join(".")
        const item = document.createElement("li")
        item.className = "entdec-pill-select__option"
        item.setAttribute("role", "option")
        item.setAttribute("aria-selected", value === chosen)

        const check = document.createElement("span")
        check.className = "entdec-pill-select__check"
        check.textContent = value === chosen ? "✓" : ""
        const text = document.createElement("span")
        text.className = "entdec-variable-picker__label"
        text.textContent = variable.label
        const name = document.createElement("code")
        name.className = "entdec-variable-picker__name"
        name.textContent = opens ? "›" : variable.name
        item.append(check, text, name)

        item.pick = () => (opens ? this.go([...this.trail, variable]) : this.choose(variable))
        item.addEventListener("click", (event) => {
          event.stopPropagation()
          item.pick()
        })
        item.addEventListener("mouseenter", () => this.highlight(item))
        return item
      })
    )
    this.highlight(this.items.find((item) => item.getAttribute("aria-selected") === "true") || this.items[0])
  }

  choose(variable) {
    this.inputTarget.value = [...this.trail, variable].map((step) => step.name).join(".")
    this.textTarget.textContent = [...this.trail, variable].map((step) => step.label).join(" › ")
    this.dispatch("change", { detail: { name: variable.name, type: variable.type, collection: !!variable.collection } })
    this.cancel()
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
      case "ArrowRight":
      case "Enter":
        if (event.key === "ArrowRight" && event.target === this.searchTarget) return
        event.preventDefault()
        this.highlighted?.pick()
        break
      case "ArrowLeft":
      case "Backspace":
        if (event.target === this.searchTarget && this.searchTarget.value) return
        if (!this.trail.length) return
        event.preventDefault()
        this.go(this.trail.slice(0, -1))
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
