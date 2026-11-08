// Registers the components' Stimulus controllers with the host's
// application:
//
//   import { registerViewComponents } from "entdec/view_components"
//   registerViewComponents(window.Stimulus)
//
// The code editor needs CodeMirror and the Liquid field TessEdit in the
// importmap; they're loaded when there, and left out otherwise.
import PillSelectController from "entdec/components/pill_select/component_controller"
import VariablePickerController from "entdec/components/variable_picker/component_controller"
import ConditionsController from "entdec/components/conditions/component_controller"

const OPTIONAL = {
  "entdec--code-editor": "entdec/components/code_editor/component_controller",
  "entdec--liquid-field": "entdec/components/liquid_field/component_controller"
}

export function registerViewComponents(application) {
  application.register("entdec--pill-select", PillSelectController)
  application.register("entdec--variable-picker", VariablePickerController)
  application.register("entdec--conditions", ConditionsController)

  return Promise.all(
    Object.entries(OPTIONAL).map(([identifier, path]) =>
      import(path)
        .then((module) => application.register(identifier, module.default))
        .catch((error) => console.warn(`entdec/view_components: ${identifier} isn't available (${error.message})`))
    )
  )
}
