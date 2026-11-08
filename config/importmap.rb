# Pins for entdec-view_components. The host app registers the controllers
# with: import { registerViewComponents } from "entdec/view_components"

pin "entdec/view_components", to: "entdec/view_components.js"
pin_all_from EntDec::ViewComponents::Engine.root.join("app/components/entdec"), under: "entdec/components", to: "entdec"
