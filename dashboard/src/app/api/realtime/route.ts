export const runtime = 'edge';

export async function GET() {
  try {
    const upstream = await fetch('https://rt-api.f1-dash.com/api/realtime', {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[realtime] upstream fetch failed:', err);
    return new Response('Upstream unreachable', { status: 502 });
  }
}
