# frozen_string_literal: true

require "test_helper"

class PillSelectTest < ComponentTest
  test "a select under a pill, with the record's value chosen" do
    render_inline EntDec::PillSelect::Component.new(form: form(Message.new(transport: "sms")), method: :transport, label: "Send via",
      options: [["Email", "mail"], ["SMS", "sms"]], tone: :operator)

    assert_select ".entdec-pill-select.entdec-pill-select--operator[data-controller='entdec--pill-select']"
    assert_select "select[name='message[transport]'][data-entdec--pill-select-target='select'] option[selected][value='sms']"
    assert_select "button.entdec-pill-select__pill[aria-label='Send via']"
  end

  test "by a name, without a record" do
    render_inline EntDec::PillSelect::Component.new(name: "rule[operator]", label: "Operator", options: [["is", "is"], ["isn't", "isnt"]], selected: "isnt")

    assert_select "select[name='rule[operator]']:not([id]) option[selected][value='isnt']"
    assert_select ".entdec-pill-select--value"
  end
end

class CodeEditorTest < ComponentTest
  test "the attribute in a hidden field, with its label and language" do
    render_inline EntDec::CodeEditor::Component.new(form: form(Message.new(text: "<Say>Hi</Say>")), method: :text, lang: "yaml", height: "400px", hint: "TwiML")

    assert_select ".form-group.form-group-text label.form-label[for=message_text]", text: "Text"
    assert_select "[data-controller='entdec--code-editor'][data-entdec--code-editor-lang-value='yaml'][data-entdec--code-editor-height-value='400px'] input[type=hidden][name='message[text]'][value='<Say>Hi</Say>']"
    assert_select "small.form-text", text: "TwiML"
  end

  test "Liquid unless it's a language it has" do
    render_inline EntDec::CodeEditor::Component.new(form: form, method: :text, lang: "cobol")

    assert_select "[data-entdec--code-editor-lang-value='liquid']"
  end
end

class LiquidFieldTest < ComponentTest
  test "around a field, with a { } button" do
    render_inline(EntDec::LiquidField::Component.new(url: "/variables?roots=x")) { "<input name='to'>".html_safe }

    assert_select "[data-controller='entdec--liquid-field'][data-entdec--liquid-field-url-value='/variables?roots=x'] input[name=to]"
    assert_select "button.entdec-liquid-field__browse", text: "{ }"
  end

  test "just the field without variables" do
    render_inline(EntDec::LiquidField::Component.new(url: nil)) { "<input name='to'>".html_safe }

    assert_select "[data-controller]", count: 0
    assert_select "input[name=to]"
  end
end

class VariablePickerTest < ComponentTest
  test "the chosen variable's label, its path in a hidden field" do
    render_inline EntDec::VariablePicker::Component.new(name: "rule[variable]", value: "user.name", label: "User › Name", url: "/variables")

    assert_select "input[type=hidden][name='rule[variable]'][value='user.name']"
    assert_select ".entdec-pill-select--neutral[data-entdec--variable-picker-url-value='/variables']", text: /User › Name/
  end

  test "asks for one without" do
    I18n.with_locale(:nl) { render_inline EntDec::VariablePicker::Component.new(name: "v", value: "", url: "/variables") }

    assert_select "button", text: /Kies een variabele/
  end
end

class ConditionsTest < ComponentTest
  def describe
    labels = {"user.state" => ["User › State", "string"], "user.born_on" => ["User › Born on", "date"]}
    ->(path) { labels[path] }
  end

  test "a row per rule, with the operators for its variable's kind" do
    render_inline EntDec::Conditions::Component.new(name: "template[conditions]", match: "any", variables_url: "/variables", describe: describe,
      rules: [{"variable" => "user.state", "operator" => "is", "value" => "active"}, {variable: "user.born_on", operator: "between", value: "2000-01-01", value_to: "2001-01-01"}, {"variable" => "user.active?", "operator" => "is", "value" => "false"}])

    assert_select "select[name='template[conditions][match]'] option[selected][value='any']"
    rules = css_select(".entdec-conditions__rules [data-entdec--conditions-target='rule']")
    assert_equal %w[string number boolean], rules.map { |rule| rule["data-kind"] }
    assert_select "input[name='template[conditions][rules][0][variable]'][value='user.state']"
    assert_includes rules.first.text, "User › State"
    assert_select "input[name='template[conditions][rules][1][value_to]'][value='2001-01-01']"
    assert_select "select[name='template[conditions][rules][2][value]'] option[selected][value='false']"
    assert_select "option[value='gt'][data-kinds='number']"
    # and a row to add
    assert_select "template input[name='template[conditions][rules][NEW_RULE][variable]']"
  end

  test "typed variables without a variables URL, and all for an unknown match" do
    render_inline EntDec::Conditions::Component.new(name: "c", match: "some", rules: [{"variable" => "order.total"}])

    assert_select "select[name='c[match]'] option[selected][value='all']"
    assert_select "input[type=text][name='c[rules][0][variable]'][value='order.total']"
    assert_select "select[name='c[rules][0][operator]'] option[selected][value='is']"
  end
end

class HelperTest < ComponentTest
  test "the helpers are in every view" do
    view = vc_test_controller.view_context
    html = view.entdec_pill_select(form(Message.new(transport: "mail")), :transport, [["Email", "mail"]])

    assert_includes html, "aria-label=\"Transport\""
    assert view.respond_to?(:entdec_code_editor)
    assert view.respond_to?(:entdec_liquid_field)
    assert view.respond_to?(:entdec_conditions)
  end
end
