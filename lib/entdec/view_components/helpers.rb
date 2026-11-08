# frozen_string_literal: true

module EntDec
  module ViewComponents
    # Helpers for the components, included in every view. In lib, not
    # app/helpers: a host's `helper :all` would look for Entdec::… there
    module Helpers
      # A select shown as a pill (see EntDec::PillSelect::Component), labelled
      # by its attribute's name
      #
      #   = entdec_pill_select f, :transport, [["Email", "mail"], ["SMS", "sms"]]
      def entdec_pill_select(form, method, options, label: form.object.class.human_attribute_name(method), **)
        render EntDec::PillSelect::Component.new(form: form, method: method, options: options, label: label, **)
      end

      # A code editor for a form's attribute (see EntDec::CodeEditor::Component)
      #
      #   = entdec_code_editor f, :text, lang: "liquid", height: "400px"
      def entdec_code_editor(form, method, **)
        render EntDec::CodeEditor::Component.new(form: form, method: method, **)
      end

      # A field that takes Liquid around the field in the block (see
      # EntDec::LiquidField::Component)
      #
      #   = entdec_liquid_field url: variables_url do
      #     = f.text_field :to
      def entdec_liquid_field(url:, &)
        render(EntDec::LiquidField::Component.new(url: url), &)
      end

      # Conditions as rules (see EntDec::Conditions::Component)
      def entdec_conditions(name:, **)
        render EntDec::Conditions::Component.new(name: name, **)
      end
    end
  end
end
