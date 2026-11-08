# frozen_string_literal: true

require "rails"
require "action_controller/railtie"
require "action_view/railtie"
require "active_model"
require "entdec/view_components"

# A Rails app just big enough to render the components
class TestApp < Rails::Application
  config.root = File.expand_path("..", __dir__)
  config.eager_load = false
  config.logger = Logger.new(nil)
  config.secret_key_base = "test"
  config.i18n.available_locales = %i[en nl]
end
Rails.application.initialize!

require "minitest/autorun"
require "rails-dom-testing"
require "view_component/test_helpers"

# A record for the components' forms
class Message
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :transport, :string
  attribute :text, :string
  attribute :to, :string

  def self.model_name = ActiveModel::Name.new(self, nil, "Message")
end

class ComponentTest < ActiveSupport::TestCase
  include ViewComponent::TestHelpers
  include Rails::Dom::Testing::Assertions

  def form(message = Message.new)
    ActionView::Helpers::FormBuilder.new(:message, message, vc_test_controller.view_context, {})
  end

  def document_root_element = Nokogiri::HTML5("<body>#{rendered_content}</body>").at("body")
end
