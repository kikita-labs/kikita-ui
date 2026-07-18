# Angular MCP

This repository uses the `angularCliKikita` MCP server.

Do not use the generic `angularCli` server for this project; that server points
at the older `discord-bot` workspace.

Use `angularCliKikita.list_projects` first when Angular workspace context
matters.

## Known Codex Tool-Call Issue

Codex can fail on valid Angular MCP `tools/call` results with
`Unexpected response type`.

This is tracked upstream as:

```text
https://github.com/openai/codex/issues/29002
```

When this Codex bug appears, do not change repository source code to work around
it. Use the default Angular CLI MCP configuration and fall back to repository
docs plus local CLI checks until Codex fixes MCP result handling.

If Angular MCP tooling is unavailable, record the exact tool error in the final
response instead of pretending the MCP best-practices gate passed.
