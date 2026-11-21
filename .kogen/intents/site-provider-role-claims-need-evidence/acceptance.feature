Feature: Provider and role claims match their evidence
  This feature covers the built Kogen website: the Get started provider text and the Providers page, which claim for each provider and role no more than the evidence shows.

  Scenario: Get started says SuperGrok and OpenCode Go can be configured and have no qualified role
    Given site-provider-role-claims-need-evidence: the production build is run with npm run build
    Then site-provider-role-claims-need-evidence: the file "dist/get-started/index.html" contains:
      | Kogen Loop can be configured with SuperGrok subscriptions, OpenCode Go workspace keys and OpenAI-compatible endpoints; none has a qualified role yet, see Providers. |
    And site-provider-role-claims-need-evidence: the file "dist/get-started/index.html" contains none of:
      | also supports |

  Scenario: Get started qualifies the QwenCloud claims
    Given site-provider-role-claims-need-evidence: the production build is run with npm run build
    Then site-provider-role-claims-need-evidence: the file "dist/get-started/index.html" contains:
      | experimental: Build connection tested in Lab with Claude Review (qwen4-max, medium); Shape and Review not qualified                |
      | The QwenCloud Build evidence came through the fleet proxy; the direct public-install Build is still under test.                    |
      | Token Plan terms restrict automation and non-interactive batch use                                                                 |
      | the pay-as-you-go URL is configurable and has not been tested through Kogen                                                        |
    And site-provider-role-claims-need-evidence: the file "dist/get-started/index.html" has the text "experimental: Build connection tested in Lab with Claude Review (qwen4-max, medium); Shape and Review not qualified" inside a link to "/providers/"
    And site-provider-role-claims-need-evidence: the QwenCloud example line in "dist/get-started/index.html" has effort medium and not high
    And site-provider-role-claims-need-evidence: the file "dist/get-started/index.html" contains none of:
      | Build verified    |
      | suits unattended  |

  Scenario: The provider data carries the fixed states, models, efforts and evidence links
    Then site-provider-role-claims-need-evidence: the data file "src/data/providers.json" has the fixed states of the 18 provider and role pairs

  Scenario: A copy of the data with a supergrok role set to connection tested is rejected
    Then site-provider-role-claims-need-evidence: a copy of the data file "src/data/providers.json" with one supergrok role set to connection tested is rejected

  Scenario: The Roles cells on the Providers page show the fixed states with evidence links
    Given site-provider-role-claims-need-evidence: the production build is run with npm run build
    Then site-provider-role-claims-need-evidence: the Roles cells in "dist/providers/index.html" show the fixed states with their evidence links
    And site-provider-role-claims-need-evidence: the file "dist/providers/index.html" contains:
      | The QwenCloud Build evidence came through the fleet proxy; the direct public-install Build is still under test. |

  Scenario: The word verified appears only inside role verified and role verified names model and effort
    Given site-provider-role-claims-need-evidence: the production build is run with npm run build
    Then site-provider-role-claims-need-evidence: the word verified occurs in "dist/providers/index.html" only inside the phrase role verified
    And site-provider-role-claims-need-evidence: the word verified occurs in "dist/get-started/index.html" only inside the phrase role verified
    And site-provider-role-claims-need-evidence: each role verified cell in "dist/providers/index.html" names a model and an effort

  Scenario: A copy of the data with a role verified entry lacking its model is rejected
    Then site-provider-role-claims-need-evidence: a copy of the data file "src/data/providers.json" with one role verified entry lacking its model is rejected

  Scenario: The Markdown twins and llms.txt do not repeat the old claims
    Given site-provider-role-claims-need-evidence: the production build is run with npm run build
    Then site-provider-role-claims-need-evidence: the file "dist/get-started.md" contains none of:
      | also supports     |
      | Build verified    |
      | suits unattended  |
    And site-provider-role-claims-need-evidence: the file "dist/llms.txt" contains none of:
      | also supports     |
      | Build verified    |
      | suits unattended  |
