---
name: code-get-project-context
description: Understand the project's purpose, apps, current architecture, stack, and implemented system flows before planning or implementing changes. Load only the app context and flow references relevant to the task.
---

# Project Context

## Project overview

**Context state: empty.** No application context has been documented yet. This is an unfilled starting point for the project that adopts this base, not a description of project-factory as a product. Empty context does not mean the repository has no application code.

When initialized, replace this paragraph with a brief description of the actual project: its purpose, users, and the responsibilities and relationships of its existing apps. Populate the app index below with verified source paths and links to their context files. Do not describe planned apps as existing.

## App index

No apps documented yet. Create entries only when there is real application content to document.

Each entry must identify the app, its type, its source path relative to the repository root, its responsibility, and links to its overview documents and system-flow index. Group apps under `backend/`, `frontend/`, or `mobile/` inside this skill. For multiple apps of the same type, use named subfolders such as `frontend/admin/`, `frontend/web/`, and `backend/api/`. These are documentation paths, not a prescribed source-code layout.

Document applications, not every workspace package. Explain a shared package or utility within the apps that consume it when it affects their architecture or flows; do not create a separate app context for `packages/utils`. Classify by responsibility: a separately running service can be an app even if its name is `utils`. Ask when an app's role or grouping is ambiguous instead of forcing it into an unrelated type.

## How to read this context

1. Read the project overview and app index to identify the apps involved in the task.
2. Open only the relevant app documents: `description.md` for purpose and responsibilities, `technology-stack.md` for technologies, `architecture-overview.md` for boundaries and integrations, and `project-structure.md` for code navigation.
3. Open the relevant app's `system-flows/README.md`, then only the selected flows' `index.md` files. Read their `code-reference.md` files when tracing or changing implementation. Follow links to another app when a contract or flow crosses that boundary.
4. Verify relevant claims against current code before relying on them. This context describes the implemented state; it may lag behind changes in the working tree.

If context is empty or incomplete, inspect the actual repository for the current task and identify the missing context. Reading this skill does not initialize or update its files automatically. The user invokes [task-update-project-context](../task-update-project-context/SKILL.md) to populate or refresh them.

## Content boundaries

Keep the project overview brief and put app details in the linked files. Create documents only when they have verified content; do not pre-create empty app folders, placeholder flows, or links to missing files. The paired update skill defines the document contents and update procedure.

This skill records what exists and how it currently behaves, including implemented business rules, contracts, and side effects. It does not store roadmaps, future plans, task progress, completion reports, or session history. Future planning and progress belong to the project's memory workflow, not these context files; do not extend that workflow as part of a context update. Consult the [memory index](../../memory/README.md) under its own rules for available decisions and requirements, and distinguish intended behavior from implemented behavior.

For reusable structural conventions, consult [code-get-coding-designs](../code-get-coding-designs/SKILL.md); for coding practices, consult [code-write-code](../code-write-code/SKILL.md). Context describes the app's actual architecture without duplicating those reusable instructions.
