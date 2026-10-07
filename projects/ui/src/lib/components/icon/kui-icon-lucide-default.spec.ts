import {
  createKuiLucideResolver,
  KUI_LUCIDE_STATIC_VERSION,
  resolveLucideIcon,
} from './kui-icon-lucide-default';

const LUCIDE_X = `<!-- @license lucide-static v1.51.0 - ISC -->
<svg
  class="lucide lucide-x"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg>`;

describe('resolveLucideIcon', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('fetches the icon from the jsDelivr CDN at the pinned version, never a floating range', async () => {
    fetchSpy.mockResolvedValue(new Response(LUCIDE_X, { status: 200 }));

    await createKuiLucideResolver()('x');

    expect(KUI_LUCIDE_STATIC_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(fetchSpy).toHaveBeenCalledWith(
      `https://cdn.jsdelivr.net/npm/lucide-static@${KUI_LUCIDE_STATIC_VERSION}/icons/x.svg`,
    );
  });

  it('returns safe glyph data instead of markup', async () => {
    fetchSpy.mockResolvedValue(new Response(LUCIDE_X, { status: 200 }));

    const icon = await createKuiLucideResolver()('x');

    expect(typeof icon).toBe('object');
    expect(icon).toEqual({
      node: [
        ['path', { d: 'M18 6 6 18' }],
        ['path', { d: 'm6 6 12 12' }],
      ],
      viewBox: '0 0 24 24',
    });
  });

  it('returns undefined when the icon is not found', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 404 }));

    expect(await createKuiLucideResolver()('not-a-real-icon')).toBeUndefined();
  });

  it('returns undefined when the request fails', async () => {
    fetchSpy.mockRejectedValue(new TypeError('offline'));

    expect(await createKuiLucideResolver()('check')).toBeUndefined();
  });

  it('does not trust a replaced file: scripts, handlers and unknown elements invalidate the icon', async () => {
    const resolver = createKuiLucideResolver();

    for (const [name, body] of [
      ['script', '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0"/></svg>'],
      ['handler-only', '<svg viewBox="0 0 24 24"><path d="M0 0" onload="alert(1)"/></svg>'],
      ['foreign', '<svg viewBox="0 0 24 24"><foreignObject><div/></foreignObject></svg>'],
      ['group', '<svg viewBox="0 0 24 24"><g><path d="M0 0"/></g></svg>'],
      ['text', '<svg viewBox="0 0 24 24"><path d="M0 0"/>surprise</svg>'],
      ['html', '<html><body>not an icon</body></html>'],
    ]) {
      fetchSpy.mockResolvedValueOnce(new Response(body, { status: 200 }));

      const icon = await resolver(name);

      if (name === 'handler-only') {
        // The element is fine; the handler is dropped.
        expect(icon).toEqual({ node: [['path', { d: 'M0 0' }]], viewBox: '0 0 24 24' });
      } else {
        expect(icon, name).toBeUndefined();
      }
    }
  });

  it('only requests valid kebab-case names', async () => {
    const resolver = createKuiLucideResolver();

    for (const name of ['../secret', 'a/b', 'A', 'x.svg', 'x y', '', 'x?y=1', 'constructor ']) {
      expect(await resolver(name)).toBeUndefined();
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('caches the pending fetch per icon name', async () => {
    fetchSpy.mockResolvedValue(new Response(LUCIDE_X, { status: 200 }));
    const resolver = createKuiLucideResolver();

    await Promise.all([resolver('check'), resolver('check')]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('reads another version or origin when asked', async () => {
    fetchSpy.mockResolvedValue(new Response(LUCIDE_X, { status: 200 }));

    await createKuiLucideResolver({ version: '9.9.9' })('x');
    await createKuiLucideResolver({ baseUrl: 'https://icons.example.test/lucide' })('x');

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      'https://cdn.jsdelivr.net/npm/lucide-static@9.9.9/icons/x.svg',
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(2, 'https://icons.example.test/lucide/x.svg');
  });

  it('exposes the default resolver bound to the pinned version', async () => {
    fetchSpy.mockResolvedValue(new Response(LUCIDE_X, { status: 200 }));

    await resolveLucideIcon('trash');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`lucide-static@${KUI_LUCIDE_STATIC_VERSION}`),
    );
  });
});
