# frozen_string_literal: true

require_relative "lib/entdec/view_components/version"

Gem::Specification.new do |spec|
  spec.name = "entdec-view_components"
  spec.version = EntDec::ViewComponents::VERSION
  spec.authors = ["Tom de Grunt"]
  spec.email = ["tom@degrunt.nl"]
  spec.homepage = "https://github.com/entdec/view_components"
  spec.summary = "Small view components for Rails forms: pill selects, a code editor, a variable picker, Liquid fields and conditions"
  spec.description = "View components with their Stimulus controllers and styles, in a Rails engine, that depend on little and are easy to style."
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.2"

  spec.files = Dir["{app,config,lib}/**/*", "MIT-LICENSE", "README.md", "CHANGELOG.md"]
  spec.require_paths = ["lib"]

  spec.add_dependency "rails", ">= 7.1"
  spec.add_dependency "view_component", ">= 3"
  spec.add_dependency "slim-rails", ">= 3"
  spec.add_dependency "importmap-rails", ">= 2"
end
