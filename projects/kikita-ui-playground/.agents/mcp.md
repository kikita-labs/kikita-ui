# MCP Servers

MCP config location differs by agent runtime — both must be kept in sync when a server is
added or removed:

- Claude Code: `.mcp.json` at the project root.
- Codex: `.codex/config.toml` (project-scoped; only loads for trusted projects) or
  `~/.codex/config.toml` (user-global, applies to every project). This is separate from
  where Codex looks for _skills_ (`.agents/skills`, not `.codex/`) — don't conflate the
  two.

This application is part of the Kikita UI workspace. MCP configuration belongs to the workspace
root's `.mcp.json` and `.codex/config.toml`; do not add duplicate `.mcp.json` or `.codex/`
directories below `projects/kikita-ui-playground/`.

## Installed servers

- **angular-mcp** — installed first, before any other scaffolding step. The Angular CLI
  ships this itself; the working command is `npx @angular/cli mcp` — no separate package to
  find or install. Use it for Angular CLI operations (generate, migrations, best-practice
  lookups) instead of guessing. Call its `list_projects` tool first when workspace context
  matters (multi-project workspace, unclear which project a command targets) — don't
  assume there's only one project.
  When a UI library is chosen at scaffold time, search the web (its docs, README, or package
  registry page) for "`@kikita-labs/ui (workspace source)` MCP server" before finishing setup — do not assume it has
  none just because it isn't listed below yet. If it ships one, install it and add a bullet
  for it here in the same change.

- **@kikita-labs/ui MCP** — `@kikita-labs/ui-mcp` is installed as a workspace development
  dependency and runs with `node node_modules/@kikita-labs/ui-mcp/src/index.js`. It exposes
  the public UI-library API and documentation for playground work.

If an MCP server is unavailable or not connected when a task needs it, stop and tell the
user. Do not silently fall back to guessing at APIs or CLI flags.

## Known Codex Gotcha

On Codex, some Angular MCP tool calls (`get_best_practices`, `search_documentation`) can
return `Unexpected response type` even while the server is healthy. Do not treat this as
the server being down and do not change project source to work around it. Instead, fall
back to the readable MCP resource (`instructions://best-practices`) and to the tools that
are known to work (`list_projects`, `run_target`). This is a client-side quirk, not a
project bug.

## Review Checklist

- [ ] Every installed server listed here matches what's actually in `.mcp.json` /
      `.codex/config.toml`.
- [ ] Both config locations exist for any server the current runtime added, or the other
      runtime's config is explicitly noted as "add if you're on Codex/Claude".
