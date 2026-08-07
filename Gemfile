source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins

# Ruby 3.4+ no longer bundles CSV, while GitHub Pages' Jekyll still requires it.
gem "csv"
gem "bigdecimal"
gem "webrick"

# GitHub Pages pins Liquid 4.0.3, which calls the String#tainted? removed in
# Ruby 3.2+. The github-pages gem also forces safe mode, so a _plugins shim is
# never loaded. Loading it from the Gemfile patches Object before Jekyll runs;
# GitHub Pages builds ignore this file entirely.
require_relative "test/ruby_compat"
