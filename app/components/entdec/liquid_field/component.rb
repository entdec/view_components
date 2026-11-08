# frozen_string_literal: true

module EntDec
  module LiquidField
    # A field that takes Liquid: around its input, textarea or code editor
    # (EntDec::CodeEditor), the variables are suggested while typing {{ (and
    # on with a dot), and a { } button beside its label browses them, with
    # TessEdit's variable menu. url is a variables endpoint like Liquidum's
    # (see EntDec::VariablePicker); without it the field is left as it is.
    #
    #   = render EntDec::LiquidField::Component.new(url: liquidum.variables_path(roots: token)) do
    #     = f.text_field :to
    #
    # Its controller needs TessEdit's JavaScript (the tess_edit gem's pins);
    # without it the controller isn't registered and the field stays plain.
    class Component < ViewComponent::Base
      attr_reader :url

      def initialize(url:)
        @url = url
        super()
      end
    end
  end
end
