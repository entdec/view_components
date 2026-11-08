# frozen_string_literal: true

module EntDec
  module CodeEditor
    # A code editor (CodeMirror 6) for a form's attribute, with its label, hint
    # and errors like the form's other fields. A hidden field holds the value.
    #
    #   = render EntDec::CodeEditor::Component.new(form: f, method: :text, lang: "liquid", height: "400px")
    #
    # lang is liquid (Liquid in HTML or XML, like TwiML), html, markdown, yaml
    # or json. Its controller has an API for other controllers to work with
    # the text (see component_controller.js), which the Liquid field uses.
    #
    # It needs CodeMirror 6 in the host's importmap (codemirror, @codemirror/state
    # and the @codemirror/lang-… it uses), which Satis pins.
    class Component < ViewComponent::Base
      LANGS = %w[liquid html markdown yaml json].freeze

      attr_reader :form, :method, :lang, :height, :hint

      def initialize(form:, method:, lang: "liquid", height: "8rem", label: nil, hint: nil, readonly: false)
        @form = form
        @method = method
        @lang = LANGS.include?(lang.to_s) ? lang.to_s : "liquid"
        @height = height
        @label = label
        @hint = hint
        @readonly = readonly
        super()
      end

      def label
        @label || form.object.class.human_attribute_name(method)
      end

      def readonly?
        @readonly
      end

      def errors
        form.object.errors[method]
      end
    end
  end
end
