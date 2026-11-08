import { Controller } from "@hotwired/stimulus"

// The conditions (component.rb): rows added from the template and removed,
// each with the operators for its variable's kind, and the values its
// operator takes: none when empty, true or false for a boolean, two for
// between. Values not shown are disabled, so they aren't sent.
export default class extends Controller {
  static targets = ["rules", "rule", "template"]
  static values = { kinds: Object }

  ruleTargetConnected(rule) {
    this.update({ target: rule })
  }

  add() {
    const html = this.templateTarget.innerHTML.replaceAll("NEW_RULE", Date.now())
    this.rulesTarget.insertAdjacentHTML("beforeend", html)
  }

  remove(event) {
    event.target.closest("[data-entdec--conditions-target='rule']").remove()
  }

  // A variable was chosen: its kind
  chosen(event) {
    const { name, type, collection } = event.detail
    const rule = event.target.closest("[data-entdec--conditions-target='rule']")
    rule.dataset.kind = collection ? "string" : !type && name.endsWith("?") ? "boolean" : this.kindsValue[type] || ""
    this.update({ target: rule })
  }

  update({ target }) {
    const rule = target.closest("[data-entdec--conditions-target='rule']")
    const select = rule.querySelector("[data-entdec--conditions-target='operator']")
    const kind = rule.dataset.kind

    select.allOptions ||= Array.from(select.options)
    const current = select.value
    const options = select.allOptions.filter((option) => !kind || option.dataset.kinds.split(" ").includes(kind))
    if (options.length !== select.options.length || options.some((option, index) => option !== select.options[index])) {
      select.replaceChildren(...options)
      select.value = options.some((option) => option.value === current) ? current : options[0]?.value
    }

    const operator = select.value
    const shown = {
      text: !["is_empty", "isnt_empty"].includes(operator) && !(kind === "boolean" && ["is", "isnt"].includes(operator)),
      boolean: kind === "boolean" && ["is", "isnt"].includes(operator),
      between: operator === "between"
    }
    rule.querySelectorAll(".entdec-conditions__value").forEach((value) => {
      value.hidden = !shown[value.dataset.role]
      value.querySelectorAll("input, select").forEach((field) => (field.disabled = value.hidden))
    })
  }
}
