import { resolveLucideIcon } from './kui-icon-lucide-default';

describe('resolveLucideIcon', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('fetches the icon SVG from the jsDelivr CDN by name', async () => {
    fetchSpy.mockResolvedValue(new Response('<svg>trash</svg>', { status: 200 }));

    const svg = await resolveLucideIcon('trash');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://cdn.jsdelivr.net/npm/lucide-static@1/icons/trash.svg'),
    );
    expect(svg).toBe('<svg>trash</svg>');
  });

  it('returns undefined when the icon is not found', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 404 }));

    const svg = await resolveLucideIcon('not-a-real-icon');

    expect(svg).toBeUndefined();
  });

  it('caches the pending fetch per icon name', async () => {
    fetchSpy.mockResolvedValue(new Response('<svg>check</svg>', { status: 200 }));

    await Promise.all([resolveLucideIcon('check'), resolveLucideIcon('check')]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
