# frozen_string_literal: true

module EntDec
  module Conditions
    # Conditions as rules, like Mail's: "If [all] of the following conditions
    # are met:", then rows of [variable] [operator] [value] (−), and (+) to add
    # one. Variables are chosen with a variable picker from variables_url
    # (see EntDec::VariablePicker), or typed without it. The operators are the
    # ones for the variable's kind: boolean, number (dates too), string or
    # object.
    #
    #   = render EntDec::Conditions::Component.new(name: "template[conditions]", match: "all",
    #       rules: [{"variable" => "user.state", "operator" => "is", "value" => "active"}],
    #       variables_url: url, describe: ->(path) { ["User › State", "string"] })
    #
    # The form sends name[match] and name[rules][<n>][variable|operator|value|value_to]
    # (value_to for between). describe gives a chosen variable's label and its
    # type (string, integer, date, boolean, object, …; nil when unknown).
    # Checking them is up to the app.
    class Component < ViewComponent::Base
      MATCHES = %w[all any].freeze
      OPERATORS = %w[is isnt matches does_not_match gt gteq lt lteq between is_empty isnt_empty].freeze
      OPERATORS_BY_KIND = {
        "boolean" => %w[is isnt is_empty isnt_empty],
        "number" => %w[is isnt gt gteq lt lteq between is_empty isnt_empty],
        "string" => %w[is isnt matches does_not_match is_empty isnt_empty],
        "object" => %w[is_empty isnt_empty]
      }.freeze
      KINDS = {"integer" => "number", "decimal" => "number", "float" => "number", "big_integer" => "number",
               "date" => "number", "datetime" => "number", "time" => "number", "boolean" => "boolean",
               "object" => "object", "string" => "string", "text" => "string"}.freeze

      Rule = Data.define(:variable, :operator, :value, :value_to)

      attr_reader :variables_url, :match

      def initialize(name:, match: "all", rules: [], variables_url: nil, describe: nil)
        @name = name
        @match = MATCHES.include?(match.to_s) ? match.to_s : "all"
        @rules = rules
        @variables_url = variables_url
        @describe = describe
        super()
      end

      def rules
        @rules.map do |rule|
          rule = rule.to_h.stringify_keys
          Rule.new(variable: rule["variable"].to_s, operator: rule["operator"].presence || "is", value: rule["value"].to_s, value_to: rule["value_to"].to_s)
        end
      end

      def name(index, field = nil)
        index.nil? ? "#{@name}[match]" : "#{@name}[rules][#{index}][#{field}]"
      end

      def match_options
        MATCHES.map { |match| [t("entdec.conditions.matches.#{match}"), match] }
      end

      # Every operator, with the kinds of variable it's for
      def operator_options
        OPERATORS.map do |operator|
          [t("entdec.conditions.operators.#{operator}"), operator, {"data-kinds" => OPERATORS_BY_KIND.select { |_, operators| operators.include?(operator) }.keys.join(" ")}]
        end
      end

      # A variable's label ("User › Name") and kind
      def describe(path)
        return [path, nil] if path.blank? || @describe.nil?

        @described ||= {}
        @described[path] ||= begin
          label, type = @describe.call(path)
          [label || path, self.class.kind(path.split(".").last, type)]
        end
      end

      # A variable's kind, by its type and name: a question (active?) is a
      # boolean
      def self.kind(name, type)
        return "boolean" if type.blank? && name.to_s.end_with?("?")

        KINDS[type.to_s]
      end

      def blank_rule
        Rule.new(variable: "", operator: "is", value: "", value_to: "")
      end
    end
  end
end
