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

When this client-side issue appears, do not treat the server as unavailable and
do not change project source or MCP configuration to work around it. Discover
and read the server's `instructions://best-practices` MCP resource. Continue using
working tools such as `list_projects` and `run_target`. Use repository docs and
local CLI checks only when the corresponding resource or tool is also unavailable.

Record the failed call and successful fallback separately. Reading the resource
satisfies loading the guide; it does not mean the failed tool call succeeded.
