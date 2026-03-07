const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { EventSource } = require('eventsource');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@f1naija.com';
const REALTIME_URL = process.env.REALTIME_URL || 'https://realtime.railway.internal';
const PORT = process.env.PORT || 3001;

// How long to wait after initial state before sending notifications.
// This prevents flooding from SSE backlog events replayed at startup.
const WARMUP_MS = 8000;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID keys! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// In-memory subscription store: endpoint -> subscription
const subscriptions = new Map();
let lastState = null;
let readyToNotify = false; // becomes true after warmup

function detectEvents(prevState, newState) {
  const notifications = [];
  if (!prevState || !newState) return notifications;

  // Track status changes
  const prevTrackStatus = prevState.trackStatus?.status;
  const newTrackStatus = newState.trackStatus?.status;
  if (prevTrackStatus !== newTrackStatus && newTrackStatus) {
    const statusMap = {
      '1': { title: '🟢 Track Clear', body: 'Track is clear — green flag!' },
      '2': { title: '🟡 Yellow Flag', body: 'Yellow flag conditions on track.' },
      '4': { title: '🚗 Safety Car', body: 'Safety car deployed on track.' },
      '5': { title: '🔴 Red Flag', body: 'Session red flagged!' },
      '6': { title: '🟡 VSC', body: 'Virtual Safety Car (VSC) deployed.' },
      '7': { title: '🟡 VSC Ending', body: 'Virtual Safety Car period ending.' },
    };
    const msg = statusMap[newTrackStatus];
    if (msg) { notifications.push({ ...msg, url: '/dashboard' }); }
  }

  // Session state changes
  const prevSessionStatus = prevState.sessionInfo?.Status;
  const newSessionStatus = newState.sessionInfo?.Status;
  if (prevSessionStatus !== newSessionStatus && newSessionStatus) {
    if (newSessionStatus === 'Started') {
      const sessionName = newState.sessionInfo?.Name || 'Session';
      notifications.push({ title: '🏁 Session Started', body: `${sessionName} is underway!`, url: '/dashboard' });
    } else if (newSessionStatus === 'Finished') {
      notifications.push({ title: '🏁 Session Finished', body: 'The session has ended.', url: '/dashboard' });
    }
  }

  // Rain / weather
  const prevRaining = prevState.weatherData?.Raining;
  const newRaining = newState.weatherData?.Raining;
  if (!prevRaining && newRaining) {
    notifications.push({ title: '🌧️ Rain!', body: 'It has started raining at the circuit.', url: '/dashboard' });
  } else if (prevRaining && !newRaining) {
    notifications.push({ title: '☀️ Rain Stopped', body: 'Rain has stopped at the circuit.', url: '/dashboard' });
  }

  // Fastest lap
  const prevFastLap = prevState.timingData?.fastestLap;
  const newFastLap = newState.timingData?.fastestLap;
  if (newFastLap && newFastLap !== prevFastLap) {
    const driver = newFastLap.driver || 'Unknown';
    const lapTime = newFastLap.time || '';
    notifications.push({ title: '⚡ Fastest Lap', body: `${driver} sets fastest lap${lapTime ? ': ' + lapTime : ''}`, url: '/dashboard' });
  }

  return notifications;
}

async function sendNotifications(notifications) {
  if (notifications.length === 0) return;
  const payload = JSON.stringify(notifications[0]);
  const dead = [];
  for (const [endpoint, subscription] of subscriptions.entries()) {
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        dead.push(endpoint);
      } else {
        console.error('Push error for', endpoint, err.message);
      }
    }
  }
  for (const endpoint of dead) {
    subscriptions.delete(endpoint);
    console.log('Removed expired subscription:', endpoint);
  }
}

function connectToRealtime() {
  const url = `${REALTIME_URL}/api/realtime`;
  console.log('Connecting to realtime SSE:', url);
  readyToNotify = false;

  const es = new EventSource(url);

  es.addEventListener('initial', (event) => {
    try {
      lastState = JSON.parse(event.data);
      console.log('Received initial state — warmup for', WARMUP_MS, 'ms (suppressing backlog notifications)');
      setTimeout(() => {
        readyToNotify = true;
        console.log('Warmup complete — notifications enabled');
      }, WARMUP_MS);
    } catch (e) {
      console.error('Failed to parse initial state:', e.message);
    }
  });

  es.addEventListener('update', async (event) => {
    try {
      const delta = JSON.parse(event.data);
      const newState = { ...lastState, ...delta };

      if (!readyToNotify) {
        // Still warming up — silently apply state updates, no notifications
        lastState = newState;
        return;
      }

      const notifications = detectEvents(lastState, newState);
      lastState = newState;

      if (notifications.length > 0) {
        console.log('Sending notifications:', notifications.map(n => n.title));
        await sendNotifications(notifications);
      }
    } catch (e) {
      console.error('Failed to process update:', e.message);
    }
  });

  es.onerror = (err) => {
    console.error('SSE error, reconnecting in 5s...', err.message || '');
    es.close();
    setTimeout(connectToRealtime, 5000);
  };
}

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', subscriptions: subscriptions.size, connected: lastState !== null, readyToNotify });
});

app.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  subscriptions.set(subscription.endpoint, subscription);
  console.log('New subscription registered. Total:', subscriptions.size);
  res.status(201).json({ message: 'Subscribed successfully' });
});

app.delete('/subscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }
  subscriptions.delete(endpoint);
  console.log('Subscription removed. Total:', subscriptions.size);
  res.json({ message: 'Unsubscribed successfully' });
});

// Tweet cache (CDN Syndication + Nitter RSS fallback)
let tweetCache = { tweets: [], fetchedAt: 0 };
const TWEET_CACHE_MS = 5 * 60 * 1000; // 5 minutes

// Strategy 1: Twitter CDN Syndication API (powers embedded timeline widgets, no auth needed)
async function fetchTweetsFromCDN() {
  try {
    const url = 'https://cdn.syndication.twimg.com/timeline/profile?screen_name=f1_naija&count=20&dnt=true&lang=en&suppress_response_codes=true';
    console.log('Trying Twitter CDN Syndication...');
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://twitter.com/',
      },
      signal: AbortSignal.timeout(10000),
    });
    console.log(`CDN status: ${res.status}`);
    const text = await res.text();
    console.log(`CDN response preview: ${text.substring(0, 500)}`);
    if (!res.ok) return null;

    const data = JSON.parse(text);
    const tweets = [];

    // Handle multiple possible response shapes
    const entries = data.body || data.timeline?.entries || data.entries || (Array.isArray(data) ? data : []);
    for (const entry of entries) {
      const td = entry.data || entry.tweet || entry.content?.tweet || entry;
      if (!td || !td.id_str) continue;
      const rawText = td.full_text || td.text || '';
      tweets.push({
        id: td.id_str,
        text: rawText,
        created_at: new Date(td.created_at).toISOString(),
      });
    }
    if (tweets.length > 0) {
      console.log(`CDN: fetched ${tweets.length} tweets`);
      return tweets;
    }
    console.log('CDN: 0 parseable tweets from response');
    return null;
  } catch (e) {
    console.log(`CDN fetch error: ${e.message}`);
    return null;
  }
}

// Strategy 2: Nitter RSS (fallback — public instances may block cloud IPs)
const NITTER_INSTANCES = [
  'https://xcancel.com',
  'https://nitter.privacyredirect.com',
  'https://lightbrd.com',
  'https://nitter.poast.org',
  'https://nitter.tiekoetter.com',
  'https://nitter.catsarch.com',
  'https://nitter.space',
];

async function fetchTweetsFromNitter() {
  for (const instance of NITTER_INSTANCES) {
    try {
      const res = await fetch(`${instance}/f1_naija/rss`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) { console.log(`Nitter ${instance} HTTP ${res.status}`); continue; }
      const xml = await res.text();
      const items = [];
      const itemRegex = new RegExp('<item>([\s\S]*?)<\/item>', 'g');
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const link = (itemXml.match(new RegExp('<link>(.*?)<\/link>')) || [])[1] || '';
        const pubDate = (itemXml.match(new RegExp('<pubDate>(.*?)<\/pubDate>')) || [])[1] || '';
        const desc = (itemXml.match(new RegExp('<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>')) || [])[1] || '';
        const idMatch = link.match(new RegExp('\/status\/(\d+)'));
        if (!idMatch) continue;
        const text = desc
          .replace(new RegExp('<[^>]+>', 'g'), '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
          .trim();
        items.push({ id: idMatch[1], text, created_at: new Date(pubDate).toISOString() });
      }
      if (items.length > 0) {
        console.log(`Nitter ${instance}: fetched ${items.length} tweets`);
        return items;
      }
    } catch (e) {
      console.log(`Nitter ${instance} failed: ${e.message}`);
    }
  }
  return null;
}

app.get('/tweets', async (req, res) => {
  const now = Date.now();
  if (now - tweetCache.fetchedAt < TWEET_CACHE_MS && tweetCache.tweets.length > 0) {
    return res.json({ tweets: tweetCache.tweets, cached: true });
  }
  // Try CDN first, then Nitter
  const tweets = (await fetchTweetsFromCDN()) || (await fetchTweetsFromNitter());
  if (tweets) {
    tweetCache = { tweets, fetchedAt: now };
    res.json({ tweets });
  } else {
    res.json({ tweets: tweetCache.tweets, error: 'All tweet sources failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Push service running on port ${PORT}`);
  connectToRealtime();
});
