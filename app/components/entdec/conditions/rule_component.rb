# frozen_string_literal: true

module EntDec
  module Conditions
    # One of the conditions' rows: [variable] [operator] [value] (−)
    class RuleComponent < ViewComponent::Base
      attr_reader :conditions, :rule, :index

      delegate :variables_url, :operator_options, to: :conditions

      def initialize(conditions:, rule:, index:)
        @conditions = conditions
        @rule = rule
        @index = index
        super()
      end

      def name(field)
        conditions.name(index, field)
      end

      def label
        @label ||= conditions.describe(rule.variable).first
      end

      def kind
        conditions.describe(rule.variable).last
      end

      def boolean_options
        [[t("entdec.conditions.true"), "true"], [t("entdec.conditions.false"), "false"]]
      end
    end
  end
end
