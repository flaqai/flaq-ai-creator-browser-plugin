# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- Specification: `.scratch/<feature-slug>/spec.md`
- Tickets: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Number tickets from `01`; do not combine them into one file.
- Record triage state with a `Status:` line near the top.
- Append discussion under `## Comments`.

When publishing an issue, create the corresponding file under `.scratch/<feature-slug>/`. When fetching a ticket, read the explicitly referenced local path.
