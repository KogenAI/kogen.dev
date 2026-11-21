Feature: The deployed commit is exposed in a kogen-build meta tag
  This feature checks that the Kogen website names the commit it was built from on every page that uses the site header.

  Scenario: Every page with the site header exposes the deployed commit
    Given kogen-dev-build-meta-one-build: the site is built once with CF_PAGES_COMMIT_SHA set to forty copies of the letter a using the build script command from package.json
    Then kogen-dev-build-meta-one-build: the build exited with status 0
    And kogen-dev-build-meta-one-build: every html file containing the site header has exactly one kogen-build meta tag with the forty letters
    And kogen-dev-build-meta-one-build: the checked html files include the home, Get started, Learn, Notes, Announcements and Origins pages

  Scenario: Base.astro places the build tag after the viewport meta with a local fallback
    Given kogen-dev-build-meta-one-build: Base.astro is read as text without a build
    Then kogen-dev-build-meta-one-build: Base.astro contains the text CF_PAGES_COMMIT_SHA
    And kogen-dev-build-meta-one-build: the text name="kogen-build" appears exactly once in Base.astro
    And kogen-dev-build-meta-one-build: the line holding the kogen-build tag is the line directly after the viewport meta line
    And kogen-dev-build-meta-one-build: the kogen-build content expression gives the commit when set and local when unset or empty
