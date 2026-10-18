# GitHub Pages deployment

The `Deploy to GitHub Pages` workflow builds the Next.js app as a static site and
deploys it when changes are pushed to `main`. It can also be started manually
from the Actions tab.

Before the first deployment:

1. In repository **Settings → Secrets and variables → Actions**, add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. In **Settings → Pages**, set the build and deployment source to **GitHub
   Actions**.

The workflow configures the project-repository path automatically. For this
repository, the site will be available at
`https://sanskari-samriti.github.io/ops-portal/` (subject to the Pages domain
configured for the organization).

These Supabase values are included in the browser bundle. Use only the
publishable/anon key, never the service-role key, and configure Supabase Row
Level Security policies to restrict access to authorized administrators.
