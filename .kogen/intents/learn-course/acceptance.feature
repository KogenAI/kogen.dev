Feature: Kogen Learn page
  The built Kogen website publishes the approved Learn page for Vibe Coding for Adults.

  Background:
    Given learn-course: the production build is run with npm run build

  Scenario: The learn route and its Markdown are generated
    Then learn-course: these built files exist:
      | dist/learn/index.html       |
      | dist/learn.md               |
      | dist/agent-content/learn.md |

  Scenario: The learn page shows exactly the approved copy
    Then learn-course: the main element of "dist/learn/index.html" is:
      """
      <main id="main" class="wrap"><article class="prose"><p class="eyebrow">Learn</p><h1>Build and ship with coding agents.</h1><p class="lead">Vibe Coding for Adults is Almir Sarajčić’s practical course on building real applications with coding agents.</p><p>If you already use a coding agent and want a more repeatable way to build, check and ship your work, follow the process through a real application.</p><h2>Build the platform behind the course</h2><p>The course platform itself is the running example. Follow the work from a feature request through implementation, tests, independent review and deployment. See how workflows, tool interfaces and persistent agent sessions fit into delivering and improving an application.</p><p>Apply the methods to your own projects with the agents and setup you use. Kogen appears as one practical tool for shaping and delivering features.</p><h2>Explore Vibe Coding for Adults</h2><p>Visit the course website to see what’s covered, how the course works and how to join.</p><div class="actions"><a class="button" href="https://vibecodingforadults.com/">Explore Vibe Coding for Adults <span aria-hidden="true">↗</span></a></div></article></main>
      """

  Scenario: The call to action links only to the course website
    Then learn-course: the main element of "dist/learn/index.html" has these links:
      | https://vibecodingforadults.com/ |

  Scenario: The page avoids commercial and curriculum detail
    Then learn-course: "dist/learn.md" contains none of these words:
      | price      |
      | pricing    |
      | $          |
      | lesson     |
      | schedule   |
      | checkout   |
      | curriculum |

  Scenario: The learn page has its own metadata
    Then learn-course: "dist/learn/index.html" has these head tags:
      | title                        | text    | Learn — Kogen                                                                                                       |
      | link[rel=canonical]          | href    | https://kogen.dev/learn/                                                                                            |
      | meta[name=description]       | content | Build and ship real applications with coding agents in Vibe Coding for Adults, a practical course by Almir Sarajčić. |
      | meta[property=og:title]      | content | Learn — Kogen                                                                                                       |
      | meta[property=og:description] | content | Build and ship real applications with coding agents in Vibe Coding for Adults, a practical course by Almir Sarajčić. |
      | meta[property=og:url]        | content | https://kogen.dev/learn/                                                                                            |
      | meta[property=og:image]      | content | https://kogen.dev/og.png                                                                                            |
      | meta[name=twitter:card]      | content | summary_large_image                                                                                                 |
      | meta[name=twitter:title]     | content | Learn — Kogen                                                                                                       |
      | meta[name=twitter:description] | content | Build and ship real applications with coding agents in Vibe Coding for Adults, a practical course by Almir Sarajčić. |
      | meta[name=twitter:image]     | content | https://kogen.dev/og.png                                                                                            |
      | meta[name=robots]            | content | index, follow                                                                                                       |
      | link[rel=alternate]          | href    | https://kogen.dev/learn.md                                                                                          |

  Scenario: Existing pages keep their metadata
    Then learn-course: "dist/index.html" has these head tags:
      | title                  | text    | Kogen — Shape the feature. Leave the build to Kogen.                                                                                                      |
      | link[rel=canonical]    | href    | https://kogen.dev/                                                                                                                                         |
      | meta[name=description] | content | Make the product and UX decisions that define the feature. Kogen handles the implementation, checking, independent review, rework, and resulting commit. |
    And learn-course: "dist/about/index.html" has these head tags:
      | title                  | text    | About — Kogen                                                                  |
      | link[rel=canonical]    | href    | https://kogen.dev/about/                                                       |
      | meta[name=description] | content | Kogen is Almir Sarajčić’s software-building project, under active development. |

  Scenario: Every Base page shows Learn in the same navigation position
    Given learn-course: the expected main navigation is:
      | /get-started/    | Get started   |
      | /learn/          | Learn         |
      | /#how-it-works   | How it works  |
      | /notes/          | Notes         |
      | /announcements/  | Announcements |
      | /origins/        | Origins       |
    Then learn-course: each of these pages has exactly that main navigation:
      | dist/index.html               |
      | dist/learn/index.html         |
      | dist/get-started/index.html   |
      | dist/about/index.html         |
      | dist/notes/index.html         |
      | dist/announcements/index.html |
      | dist/origins/index.html       |

  Scenario: The sitemap keeps its existing entries
    Then learn-course: the sitemap "dist/sitemap.xml" begins with these locations:
      | https://kogen.dev/               |
      | https://kogen.dev/get-started/   |
      | https://kogen.dev/origins/       |
      | https://kogen.dev/notes/         |
      | https://kogen.dev/announcements/ |
    And learn-course: the sitemap "dist/sitemap.xml" has no duplicate locations

  Scenario: The sitemap lists the learn page after the existing entries
    Then learn-course: the sitemap "dist/sitemap.xml" ends with these locations:
      | https://kogen.dev/learn/   |
      | https://kogen.dev/about/   |
      | https://kogen.dev/contact/ |
      | https://kogen.dev/privacy/ |

  Scenario: The generated Markdown for the learn page is exact
    Then learn-course: the Markdown file "dist/learn.md" is:
      """
      # Learn — Kogen

      Learn

      # Build and ship with coding agents.

      Vibe Coding for Adults is Almir Sarajčić’s practical course on building real applications with coding agents.

      If you already use a coding agent and want a more repeatable way to build, check and ship your work, follow the process through a real application.

      ## Build the platform behind the course

      The course platform itself is the running example. Follow the work from a feature request through implementation, tests, independent review and deployment. See how workflows, tool interfaces and persistent agent sessions fit into delivering and improving an application.

      Apply the methods to your own projects with the agents and setup you use. Kogen appears as one practical tool for shaping and delivering features.

      ## Explore Vibe Coding for Adults

      Visit the course website to see what’s covered, how the course works and how to join.

      [Explore Vibe Coding for Adults](https://vibecodingforadults.com/)

      ---

      Canonical page: https://kogen.dev/learn
      """

  Scenario: The agent-content copy is identical to the Markdown twin
    Then learn-course: "dist/learn.md" and "dist/agent-content/learn.md" are identical

  Scenario: Other generated Markdown and agent files are still produced
    Then learn-course: these built files exist:
      | dist/index.md       |
      | dist/get-started.md |
      | dist/about.md       |
      | dist/contact.md     |
      | dist/privacy.md     |
      | dist/notes.md       |
      | dist/origins.md     |
      | dist/llms.txt       |
