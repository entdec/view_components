# frozen_string_literal: true

module EntDec
  module ViewComponents
    class Engine < ::Rails::Engine
      engine_name "entdec_view_components"

      # app/components/entdec is EntDec::…, not Entdec::…
      initializer "entdec_view_components.inflections", before: :set_autoload_paths do
        Rails.autoloaders.each { |autoloader| autoloader.inflector.inflect("entdec" => "EntDec") }
      end

      initializer "entdec_view_components.helpers" do
        ActiveSupport.on_load(:action_view) { include EntDec::ViewComponents::Helpers }
      end

      initializer "entdec_view_components.assets" do |app|
        if app.config.respond_to?(:assets)
          app.config.assets.paths << root.join("app/javascript")
          # The components' Stimulus controllers
          app.config.assets.paths << root.join("app/components")
        end
      end

      initializer "entdec_view_components.importmap", before: "importmap" do |app|
        app.config.importmap.paths << root.join("config/importmap.rb")
        app.config.importmap.cache_sweepers << root.join("app/javascript")
        app.config.importmap.cache_sweepers << root.join("app/components")
      end
    end
  end
end
