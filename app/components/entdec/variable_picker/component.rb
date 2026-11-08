# frozen_string_literal: true

module EntDec
  module VariablePicker
    # A Liquid variable chosen as a (gray, attribute) pill, from a popover
    # that goes into its variables a level at a time. url is an endpoint like
    # Liquidum's: GET url&path=user.account answers {variables: [{name, label,
    # type, collection, children}]}. A hidden field holds its path
    # ("user.account.name"); choosing one fires entdec--variable-picker:change
    # with its type, name and whether it's a collection.
    #
    #   = render EntDec::VariablePicker::Component.new(name: "rule[variable]", value: "user.name", label: "User › Name", url: url)
    class Component < ViewComponent::Base
      attr_reader :name, :value, :url

      def initialize(name:, value:, url:, label: nil)
        @name = name
        @value = value
        @label = label
        @url = url
        super()
      end

      def label
        value.present? ? (@label || value) : t("entdec.variable_picker.choose")
      end
    end
  end
end
