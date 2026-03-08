const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { EventSource } = require('eventsource');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL       = process.env.VAPID_EMAIL || 'mailto:admin@f1naija.com';
const REALTIME_URL      = process.env.REALTIME_URL || 'https://rt-api.f1-dash.com';
const PORT              = process.env.PORT || 3001;

// TTL for push notifications (seconds).
// Short TTL means stale notifications are discarded instead of delivered
// hours/days later when a device comes back online.
const PUSH_TTL_SECONDS = 300; // 5 minutes

// Warmup period after SSE connect before notifications are allowed.
// Prevents flooding from SSE backlog events replayed at startup.
const WARMUP_MS = 60000; // 60s

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID keys! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// In-memory subscription store: endpoint -> subscription
const subscriptions = new Map();
let lastState       = null;
let readyToNotify   = false; // true after warmup

// Detect push-worthy events by diffing prevState vs newState.
// Field names MUST match the PascalCase keys used by the f1-dash SSE API
// (TrackStatus.Status, SessionStatus.Status, WeatherData.Rainfall, etc.)
function detectEvents(prevState, newState) {
  const notifications = [];
  if (!prevState || !newState) return notifications;

  // ── Track status ──────────────────────────────────────────────────────────
  // TrackStatus.Status: "1"=Clear "2"=Yellow "4"=SafetyCar "5"=Red "6"=VSC "7"=VSCEnding
  const prevTrack = prevState.TrackStatus && prevState.TrackStatus.Status;
  const newTrack  = newState.TrackStatus  && newState.TrackStatus.Status;
  if (prevTrack !== newTrack && newTrack) {
    const statusMap = {
      '1': { title: '🟢 Track Clear',   body: 'Track is clear — green flag!' },
      '2': { title: '🟡 Yellow Flag',   body: 'Yellow flag conditions on track.' },
      '4': { title: '🚗 Safety Car',    body: 'Safety car deployed on track.' },
      '5': { title: '🔴 Red Flag',      body: 'Session red flagged!' },
      '6': { title: '🟡 VSC',           body: 'Virtual Safety Car (VSC) deployed.' },
      '7': { title: '🟡 VSC Ending',    body: 'Virtual Safety Car period ending.' },
    };
    const msg = statusMap[newTrack];
    if (msg) notifications.push({ ...msg, url: '/dashboard' });
  }

  // ── Session status ────────────────────────────────────────────────────────
  // SessionStatus.Status: "Started" | "Finished" | "Finalised" | "Ends"
  const prevSession = prevState.SessionStatus && prevState.SessionStatus.Status;
  const newSession  = newState.SessionStatus  && newState.SessionStatus.Status;
  if (prevSession !== newSession && newSession) {
    const sessionName = (newState.SessionInfo && newState.SessionInfo.Name) || 'Session';
    if (newSession === 'Started') {
      notifications.push({
        title: '🏁 Session Started',
        body:  sessionName + ' is underway!',
        url:   '/dashboard',
      });
    } else if (newSession === 'Finished' || newSession === 'Finalised') {
      notifications.push({
        title: '🏁 Session Ended',
        body:  sessionName + ' has ended.',
        url:   '/dashboard',
      });
    }
  }

  // ── Rain / weather ────────────────────────────────────────────────────────
  // WeatherData.Rainfall is a STRING "0" or "1", NOT a boolean
  const prevRain = prevState.WeatherData && prevState.WeatherData.Rainfall === '1';
  const newRain  = newState.WeatherData  && newState.WeatherData.Rainfall  === '1';
  if (!prevRain && newRain) {
    notifications.push({ title: '🌧️ Rain!', body: 'It has started raining at the circuit.', url: '/dashboard' });
  } else if (prevRain && !newRain) {
    notifications.push({ title: '☀️ Rain Stopped', body: 'Rain has stopped at the circuit.', url: '/dashboard' });
  }

  // ── Race control messages ─────────────────────────────────────────────────
  // More reliable than TrackStatus for SC/VSC/Red Flag alerts
  const prevMsgs = (prevState.RaceControlMessages && prevState.RaceControlMessages.Messages) || [];
  const newMsgs  = (newState.RaceControlMessages  && newState.RaceControlMessages.Messages)  || [];
  if (newMsgs.length > prevMsgs.length) {
    const latest = newMsgs[newMsgs.length - 1];
    if (latest) {
      if (latest.Flag === 'RED') {
        notifications.push({ title: '🔴 Red Flag!', body: latest.Message || 'Session red flagged.', url: '/dashboard' });
      } else if (latest.Category === 'SafetyCar') {
        notifications.push({ title: '🚗 Race Control', body: (latest.Message || 'Safety Car event').substring(0, 100), url: '/dashboard' });
      } else if (latest.Flag === 'CHEQUERED') {
        notifications.push({ title: '🏁 Chequered Flag', body: latest.Message || 'Race finished!', url: '/dashboard' });
      }
    }
  }

  return notifications;
}

async function sendNotifications(notifications) {
  if (notifications.length === 0) return;
  const payload = JSON.stringify(notifications[0]);
  const pushOptions = { TTL: PUSH_TTL_SECONDS };
  const dead = [];
  for (const [endpoint, subscription] of subscriptions.entries()) {
    try {
      await webpush.sendNotification(subscription, payload, pushOptions);
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
  const url = REALTIME_URL + '/api/realtime';
  console.log('Connecting to realtime SSE:', url);
  readyToNotify = false;

  const es = new EventSource(url);

  es.addEventListener('initial', (event) => {
    try {
      lastState = JSON.parse(event.data);
      console.log('Received initial state — warmup for', WARMUP_MS, 'ms');
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
      const delta    = JSON.parse(event.data);
      const newState = Object.assign({}, lastState, delta);

      if (!readyToNotify) {
        lastState = newState;
        return;
      }

      const notifications = detectEvents(lastState, newState);
      lastState = newState;

      if (notifications.length > 0) {
        console.log('Sending notifications:', notifications.map((n) => n.title));
        await sendNotifications(notifications);
      }
    } catch (e) {
      console.error('Failed to process update:', e.message);
    }
  });

  es.onerror = (err) => {
    console.error('SSE error, reconnecting in 5s...', (err && err.message) || '');
    es.close();
    setTimeout(connectToRealtime, 5000);
  };
}

// ── REST endpoints ────────────────────────────────────────────────────────────

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

// ── Tweet cache ───────────────────────────────────────────────────────────────

let tweetCache = { tweets: [], fetchedAt: 0 };
const TWEET_CACHE_MS = 30 * 60 * 1000; // 30 minutes

function parseTweetsFromHtml(html) {
  const tweets = [];
  const itemRe = /<li[^>]+data-tweet-id="(\d+)"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const id    = m[1];
    const inner = m[2];
    const textMatch = /<p[^>]*class="[^"]*timeline-Tweet-text[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(inner);
    const rawText   = textMatch
      ? textMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
      : '';
    const timeMatch = /<time[^>]+datetime="([^"]+)"/.exec(inner) || /data-datetime="([^"]+)"/.exec(inner);
    const created_at = timeMatch ? new Date(timeMatch[1]).toISOString() : new Date().toISOString();
    if (rawText) tweets.push({ id, text: rawText, created_at });
  }
  return tweets;
}

async function fetchTweetsFromCDN() {
  const cdnUrl = 'https://cdn.syndication.twimg.com/timeline/profile?screen_name=f1_naija&count=20&lang=en&callback=f1nCallback';
  try {
    console.log('Trying CDN JSONP: timeline/profile');
    const res = await fetch(cdnUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'text/javascript, application/javascript, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://twitter.com/',
        'Origin':          'https://twitter.com',
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    console.log('CDN JSONP: status=' + res.status + ' bodyLen=' + body.length);
    if (body && body.trim()) {
      const match   = body.match(/^[^(]+\(([\s\S]*)\)\s*;?\s*$/);
      const jsonStr = match ? match[1] : body;
      const data    = JSON.parse(jsonStr);
      const htmlBody = data.body || '';
      if (htmlBody) {
        const tweets = parseTweetsFromHtml(htmlBody);
        if (tweets.length > 0) { console.log('CDN JSONP: got ' + tweets.length + ' tweets'); return tweets; }
        console.log('CDN JSONP: 0 tweets parsed from HTML');
      }
    } else {
      console.log('CDN JSONP: empty body (cloud IP may be blocked)');
    }
  } catch (e) { console.log('CDN JSONP error: ' + e.message); }

  const synUrl = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/f1_naija?lang=en';
  try {
    console.log('Trying syndication.twitter.com');
    const res = await fetch(synUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://twitter.com/',
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    if (res.ok && body) {
      const tweets = parseTweetsFromHtml(body);
      if (tweets.length > 0) { console.log('Syndication: got ' + tweets.length + ' tweets'); return tweets; }
    }
  } catch (e) { console.log('Syndication error: ' + e.message); }
  return null;
}

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
      const res = await fetch(instance + '/f1_naija/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal:  AbortSignal.timeout(8000),
      });
      if (!res.ok) { console.log('Nitter ' + instance + ' HTTP ' + res.status); continue; }
      const xml   = await res.text();
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const linkM = itemXml.match(/<link>(.*?)<\/link>/);
        const dateM = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        const descM = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
        const idM   = linkM && linkM[1].match(/\/status\/(\d+)/);
        if (!idM) continue;
        const text = (descM ? descM[1] : '')
          .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
        items.push({ id: idM[1], text, created_at: new Date(dateM ? dateM[1] : '').toISOString() });
      }
      if (items.length > 0) { console.log('Nitter ' + instance + ': fetched ' + items.length + ' tweets'); return items; }
    } catch (e) { console.log('Nitter ' + instance + ' failed: ' + e.message); }
  }
  return null;
}

app.get('/tweets', async (req, res) => {
  const now = Date.now();
  if (now - tweetCache.fetchedAt < TWEET_CACHE_MS && tweetCache.tweets.length > 0) {
    return res.json({ tweets: tweetCache.tweets, cached: true });
  }
  const tweets = (await fetchTweetsFromCDN()) || (await fetchTweetsFromNitter());
  if (tweets) {
    tweetCache = { tweets, fetchedAt: now };
    res.json({ tweets });
  } else {
    res.json({ tweets: tweetCache.tweets, error: 'All tweet sources failed' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('Push service running on port ' + PORT);
  connectToRealtime();
});
