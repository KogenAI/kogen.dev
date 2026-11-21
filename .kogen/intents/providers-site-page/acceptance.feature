Feature: Kogen providers page and QwenCloud setup
  This feature covers the built Kogen website: the QwenCloud subsection on Get started, the Providers comparison page and the links that discover it.

  Scenario: Get started names QwenCloud with its setup, label and Token Plan note
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: the text of "dist/get-started/index.html" contains:
      | QwenCloud                                                                       |
      | kogen provider login openai-compatible                                          |
      | base_url: https://token-plan.maas.qwencloudapi.com/compatible-mode/v1           |
      | model: qwen4-max                                                                |
      | effort: high                                                                    |
      | https://ap-southeast-1.maas.qwencloudapi.com/compatible-mode/v1                 |
      | experimental: Build verified with Claude Review; Shape and Review not qualified |
      | Token Plan terms restrict automation and non-interactive batch use              |
      | pay-as-you-go suits unattended loops                                            |

  Scenario: The QwenCloud subsection sits under the OpenAI-compatible text and links to Providers
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: the QwenCloud subsection of "dist/get-started/index.html" follows the OpenAI-compatible text, precedes "3. Set up your repository" and links to "https://kogen.dev/providers/"

  Scenario: Existing Get started text stays and the new copy has no emoji
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: the text of "dist/get-started/index.html" contains:
      | Kogen Loop also supports SuperGrok subscriptions, OpenCode Go workspace keys and OpenAI-compatible endpoints. |
      | OpenAI-compatible login asks for the endpoint’s base URL and API key.                                         |
      | kogen provider login claude-code                                                                              |
      | Claude with an Anthropic API key runs through Kogen Loop.                                                     |
    And providers-site-page: the main element of "dist/get-started/index.html" contains no emoji
    And providers-site-page: the main element of "dist/providers/index.html" contains no emoji

  Scenario: The Providers page has a row for every provider in the data file
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: these built files exist:
      | dist/providers/index.html |
    And providers-site-page: the table in "dist/providers/index.html" has a row for every provider in the data file "src/data/providers.json"

  Scenario: The data file lists exactly the provider names the CLI accepts
    Then providers-site-page: the CLI provider names fixture lists exactly:
      | chatgpt           |
      | supergrok         |
      | opencode-go       |
      | anthropic         |
      | claude-code       |
      | openai-compatible |
    And providers-site-page: the provider names in the data file "src/data/providers.json" equal the names in the fixture "src/data/cli-provider-names.txt"

  Scenario: The real provider data has no verified role with an empty record
    Then providers-site-page: no role in the data file "src/data/providers.json" is verified with an empty record

  Scenario: llms.txt and Get started link to Providers and the Markdown twin exists
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: both "dist/llms.txt" and "dist/get-started/index.html" link to "https://kogen.dev/providers/"
    And providers-site-page: these built files exist:
      | dist/providers/index.md |
      | dist/providers.md       |
    And providers-site-page: the head of "dist/providers/index.html" offers the Markdown twin "https://kogen.dev/providers.md"

  Scenario: The sitemap lists the Providers page once
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: "dist/sitemap.xml" lists "https://kogen.dev/providers/" exactly once

  Scenario: The build fails when the data file lacks a provider name the CLI accepts
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: npm run build fails for a copy of the data file "src/data/providers.json" without the provider "claude-code"

  Scenario: The build fails when a role is verified with an empty record
    Given providers-site-page: the production build is run with npm run build
    Then providers-site-page: npm run build fails when the data file "src/data/providers.json" marks a role verified with an empty record
