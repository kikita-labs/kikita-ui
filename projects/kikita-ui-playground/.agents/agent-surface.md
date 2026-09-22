# Agent Surface (JSDoc)

Present only because this project opted into mandatory JSDoc. Delete this file (and its
`AGENTS.md` link) if that questionnaire answer was "no".

- Every exported component, directive, service, provider, type, and token has a JSDoc
  comment: one line stating what it is, plus `@param`/`@returns` when not obvious from the
  signature.
- JSDoc is English only, same as all other tracked content.
- Do not document behavior that isn't implemented yet — JSDoc describes what the code does
  now, not the roadmap.
- Keep JSDoc next to the declaration it documents; don't centralize it in a separate file.

```ts
/** Formats a user's display name, falling back to their email local-part. */
export function formatDisplayName(user: User): string {
  return user.displayName ?? user.email.split('@')[0];
}
```

## Review Checklist

- [ ] Every new public export has JSDoc.
- [ ] JSDoc matches current behavior, not planned behavior.
- [ ] English only.
