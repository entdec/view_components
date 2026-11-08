# frozen_string_literal: true

module EntDec
  module PillSelect
    # A select shown as a pill, chosen from in a popover, like Mensa's
    # filters: the options with a check on the chosen one, searchable when
    # there are many. A native select underneath holds the value, so the form,
    # and the controllers listening to it (toggles, chained selects), work as
    # with any select; the popover reads its options when it opens.
    #
    #   = render EntDec::PillSelect::Component.new(form: f, method: :transport, label: "Send via",
    #       options: [["Email", "mail"], ["SMS", "sms"]], select_html: {"data-toggle-target" => "input"})
    #
    # Without a form, or for a field that isn't the record's attribute, it
    # takes a name instead (and selected):
    #
    #   = render EntDec::PillSelect::Component.new(name: "rule[operator]", label: "Operator", options:, selected: "is")
    #
    # options are [label, value] or [label, value, {html attributes}]. tone is
    # :value (blue), :operator (violet) or :neutral (gray: an attribute), as in
    # Mensa: [Born on] [is in] [4 weeks]. Fields alongside it
    # look the same with the entdec-pill-input class.
    class Component < ViewComponent::Base
      TONES = %i[value operator neutral].freeze

      attr_reader :form, :method, :name, :label, :options, :tone, :select_html

      def initialize(label:, options:, form: nil, method: nil, name: nil, selected: nil, tone: :value, select_html: {})
        @form = form
        @method = method
        @name = name
        @label = label
        @options = options
        @selected = selected
        @tone = TONES.include?(tone) ? tone : :value
        @select_html = select_html
        super()
      end

      def selected
        (@selected.nil? && form) ? form.object&.public_send(method) : @selected
      end

      def native_select
        html = select_html.merge(:class => "entdec-pill-select__native", :tabindex => -1, "aria-hidden" => true,
          "data-entdec--pill-select-target" => "select")
        return select_tag(name, options_for_select(options, selected), html.reverse_merge(id: nil)) if name

        form.select(method, options_for_select(options, selected), {}, html)
      end
    end
  end
end
