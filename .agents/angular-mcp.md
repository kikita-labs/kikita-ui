# Angular MCP

This repository uses the `angularCliKikita` MCP server.

Do not use the generic `angularCli` server for this project; that server points
at the older `discord-bot` workspace.

Use `angularCliKikita.list_projects` first when Angular workspace context
matters.

The current Angular CLI MCP tools `get_best_practices` and
`search_documentation` can return `Unexpected response type` in Codex while the
server is otherwise healthy. When that happens, read the MCP resource
`instructions://best-practices` from `angularCliKikita` instead of silently
falling back to guesses.

Known working Angular MCP source for best practices:

```text
server: angularCliKikita
resource: instructions://best-practices
```
