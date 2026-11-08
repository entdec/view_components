# EntDec view components

Small view components (ViewComponent, Slim, Stimulus, Tailwind) shared by
Entdec's engines and apps, as a Rails engine:

- **`EntDec::PillSelect`**: a select shown as a pill, chosen from in a popover, like Mensa's filters.
- **`EntDec::VariablePicker`**: a pill to choose a variable with, drilling down from a variables endpoint.
- **`EntDec::Conditions`**: rules like Mail's: "If [all] of the following conditions are met", then rows of [variable] [operator] [value].
- **`EntDec::CodeEditor`**: CodeMirror 6 for a form's attribute, with an API for other controllers.
- **`EntDec::LiquidField`**: Liquid variables suggested while typing `{{` in an input, textarea or code editor, and a `{ }` button to browse them.

## Installation

In the Gemfile (or as a dependency in an engine's gemspec, with this line in
its Gemfile):

```ruby
gem "entdec-view_components", github: "entdec/view_components"
```

The engine adds its pins to the importmap. Register the controllers with the
host's Stimulus application:

```js
import { registerViewComponents } from "entdec/view_components"
registerViewComponents(window.Stimulus)
```

And include the styles in the host's Tailwind CSS (tailwindcss-rails v4), in
`app/assets/tailwind/application.css`:

```css
@import "../builds/tailwind/entdec_view_components";
```

### Optional JavaScript

- The code editor needs CodeMirror 6 in the importmap: `codemirror`,
  `@codemirror/state`, `@codemirror/view` and `@codemirror/lang-liquid`,
  `-html`, `-markdown`, `-yaml` and `-json` (Satis pins them).
- The Liquid field needs [TessEdit](https://github.com/entdec/tess_edit)'s
  JavaScript (`tess_edit/core/variables` and `tess_edit/ui/variable_menu`).

Without them those two controllers aren't registered (with a warning in the
console) and the fields stay plain.

### With esbuild

With jsbundling-rails instead of importmap-rails, your build has to resolve
the gem's imports: `entdec/view_components` is the gem's
`app/javascript/entdec/view_components.js` and `entdec/components/x` its
`app/components/entdec/x.js`. A bundle includes the code editor's and the
Liquid field's controllers, so CodeMirror's packages (from npm) and TessEdit's
JavaScript have to resolve too. For example, in an esbuild plugin:

```js
const root = execSync("bundle show entdec-view_components").toString().trim()

build.onResolve({ filter: /^entdec\// }, ({ path }) => {
  const subpath = path.replace(/^entdec\//, "")
  return { path: subpath.startsWith("components/")
    ? `${root}/app/components/entdec/${subpath.replace(/^components\//, "")}.js`
    : `${root}/app/javascript/entdec/${subpath}.js` }
})
```

## Variables

The variable picker, the conditions and the Liquid field read variables from
an endpoint like [Liquidum](https://github.com/entdec/liquidum)'s:
`GET <url>&path=<path>` returns

```json
{"variables": [{"name": "user", "label": "User", "type": "object", "hint": "…", "collection": false, "children": true}]}
```

for the variables at a path (the roots at an empty one).

## Usage

The helpers are in every view.

### Pill select

```slim
= entdec_pill_select f, :transport, [["Email", "mail"], ["SMS", "sms"]]
= render EntDec::PillSelect::Component.new(form: f, method: :transport, label: "Send via", options:, tone: :operator)
= render EntDec::PillSelect::Component.new(name: "rule[operator]", label: "Operator", options:, selected: "is")
```

options are `[label, value]` or `[label, value, {html attributes}]`. tone is
`:value` (blue, the default), `:operator` (violet) or `:neutral` (gray, an
attribute). A native select underneath holds the value, so forms and other
controllers listening to it work as with any select. `select_html:` adds
attributes to it. A text field next to the pills looks the same with the
`entdec-pill-input` class.

### Variable picker

```slim
= render EntDec::VariablePicker::Component.new(name: "rule[variable]", value: "user.name", label: "User › Name", url: variables_url)
```

A hidden field holds the variable's path.

### Conditions

```slim
= entdec_conditions name: "template[conditions]", match: "all",
    rules: [{"variable" => "user.state", "operator" => "is", "value" => "active"}],
    variables_url: variables_url, describe: ->(path) { ["User › State", "string"] }
```

The form sends `name[match]` (all or any) and
`name[rules][<n>][variable|operator|value|value_to]` (value_to for between).
The operators are `is isnt matches does_not_match gt gteq lt lteq between
is_empty isnt_empty`, offered by the variable's kind: boolean, number (dates
too), string or object. describe gives a variable's label and type (string,
integer, date, boolean, object, …, or nil when unknown). Without a
variables_url, variables are typed. Checking the conditions is up to the app.

### Code editor

```slim
= entdec_code_editor f, :text, lang: "liquid", height: "400px", hint: "…", readonly: false
```

lang is liquid (Liquid in HTML or XML), html, markdown, yaml or json. Its
controller (`entdec--code-editor`) has an API for other controllers,
documented in `app/components/entdec/code_editor/component_controller.js`:
connect, change and blur events, and `textAround`, `replaceAround`, `insert`,
`caretRect`, `value` and `focus`.

### Liquid field

```slim
= entdec_liquid_field url: variables_url do
  = f.text_field :to
= entdec_liquid_field url: variables_url do
  = entdec_code_editor f, :text
```

Without a url the field is left as it is.

## Translations

English and Dutch, under `entdec.*` in `config/locales`.

## Development

```sh
bundle install
bundle exec rake test
bundle exec standardrb
```

## License

MIT, see MIT-LICENSE.
