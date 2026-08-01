# Local build compatibility for GitHub Pages' pinned Liquid on Ruby 3.2+.
# GitHub Pages itself uses a compatible Ruby and does not load this file.
unless Object.method_defined?(:tainted?)
  class Object
    def tainted?
      false
    end
  end
end

unless String.method_defined?(:untaint)
  class String
    def untaint
      self
    end
  end
end
