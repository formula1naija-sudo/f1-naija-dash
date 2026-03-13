const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { EventSource } = require('eventsource');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL       = process.env.VAPID_EMAIL || 'mailto:admin@f1naija.com';
const REALTIME_URL      = process.env.REALTIME_URL || 'https://rt-api.f1-dash.com';
const PORT              = process.env.PORT || 3001;
const OPENF1_URL        = 'https://api.openf1.org/v1';

// TTL for push notifications (seconds).
// Short TTL means stale notifications are discarded instead of delivered late.
const PUSH_TTL_SECONDS = 300; // 5 minutes

// Warmup period after SSE connect before notifications are allowed.
// Prevents flooding from SSE backlog events replayed at startup.
const WARMUP_MS = 60000; // 60s

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID keys! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// ââ Persistent subscription store ââââââââââââââââââââââââââââââââââââââââââââ
const SUBS_FILE = path.join(__dirname, 'subscriptions.json');

function loadSubscriptions() {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
      console.log('Loaded ' + Object.keys(data).length + ' subscriptions from disk');
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.error('Failed to load subscriptions from disk:', e.message);
  }
  return new Map();
}

function saveSubscriptions() {
  try {
    const obj = Object.fromEntries(subscriptions);
    fs.writeFileSync(SUBS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save subscriptions to disk:', e.message);
  }
}

const subscriptions = loadSubscriptions();

let lastState     = null;
let readyToNotify = false;

// ââ Helper: get P1 driver display name from state ââââââââââââââââââââââââââââ
function getP1Driver(state) {
  const timingLines = state.TimingData && state.TimingData.Lines;
  const driverList  = state.DriverList;
  if (!timingLines) return null;

  for (const [num, line] of Object.entries(timingLines)) {
    if (Number(line.Position) === 1) {
      if (driverList && driverList[num]) {
        const d = driverList[num];
        // Use last name for brevity: "NORRIS", "VERSTAPPEN"
        return d.LastName || d.FullName || d.Abbreviation || ('Car #' + num);
      }
      return 'Car #' + num;
    }
  }
  return null;
}

// ââ Helper: build qualifying summary (top 3) âââââââââââââââââââââââââââââââââ
function getQualiTop3(state) {
  const timingLines = state.TimingData && state.TimingData.Lines;
  const driverList  = state.DriverList;
  if (!timingLines) return null;

  const sorted = Object.entries(timingLines)
    .map(([num, line]) => ({ num, pos: Number(line.Position || 99) }))
    .filter(x => x.pos > 0)
    .sort((a, b) => a.pos - b.pos)
    .slice(0, 3);

  if (sorted.length === 0) return null;

  return sorted.map((x, i) => {
    const d = driverList && driverList[x.num];
    const name = d ? (d.LastName || d.Abbreviation || ('Car #' + x.num)) : ('Car #' + x.num);
    return (i + 1) + '. ' + name;
  }).join(' | ');
}

// ââ Detect push-worthy events by diffing prevState vs newState âââââââââââââââ
function detectEvents(prevState, newState) {
  const notifications = [];
  if (!prevState || !newState) return notifications;

  const sessionName = (newState.SessionInfo && newState.SessionInfo.Name) || 'Session';
  const sessionType = (newState.SessionInfo && newState.SessionInfo.Type) || '';
  const gpName      = (newState.SessionInfo && newState.SessionInfo.Meeting && newState.SessionInfo.Meeting.Name)
                      || sessionName;

  // ââ Track status ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  // TrackStatus.Status: "1"=Clear "2"=Yellow "4"=SafetyCar "5"=Red "6"=VSC "7"=VSCEnding
  const prevTrack = prevState.TrackStatus && prevState.TrackStatus.Status;
  const newTrack  = newState.TrackStatus  && newState.TrackStatus.Status;
  if (prevTrack !== newTrack && newTrack) {
    const statusMap = {
      '1': { title: 'ð¢ Track Clear',       body: 'Green flag â racing resumed!' },
      '2': { title: 'ð¡ Yellow Flag',        body: 'Yellow flag conditions on track.' },
      '4': { title: 'ð,Safety Car',        body: 'Safety car deployed on track.' },
      '5': { title: 'ð´ Red Flag!',          body: 'Session has been red flagged.' },
      '6': { title: 'â ï¸ Virtual Safety Car', body: 'VSC deployed â no overtaking.' },
      '7': { title: 'â ï¸ VSC Ending',         body: 'VSC period ending â prepare to push!' },
    };
    const msg = statusMap[newTrack];
    if (msg) notifications.push({ ...msg, url: '/dashboard' });
  }

  // ââ Session status ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const prevSession = prevState.SessionStatus && prevState.SessionStatus.Status;
  const newSession  = newState.SessionStatus  && newState.SessionStatus.Status;

  if (prevSession !== newSession && newSession) {
    if (newSession === 'Started') {
      notifications.push({
        title: 'ð ' + sessionName + ' â LIVE',
        body:  sessionName + ' at ' + gpName + ' is underway',
        url:   '/dashboard',
      });
    } else if (newSession === 'Finished' || newSession === 'Finalised') {
      // Build a meaningful summary based on session type
      const isQualifying = /qualifying/i.test(sessionType);
      const isRace       = /^race$/i.test(sessionType) || /^sprint$/i.test(sessionType);
      const isSprint     = /sprint/i.test(sessionType);
      const isPractice   = /practice/i.test(sessionType);

      if (isQualifying) {
        const pole   = getP1Driver(newState);
        const top3   = getQualiTop3(newState);
        notifications.push({
          title: 'ð ' + sessionName + ' Results',
          body:  pole
            ? (pole + ' takes Pole Position!' + (top3 ? ' Top 3: ' + top3 : ''))
            : (gpName + ' qualifying complete'),
          url: '/dashboard',
        });
      } else if (isRace || isSprint) {
        const winner = getP1Driver(newState);
        notifications.push({
          title: isSprint ? 'ðï¸ Sprint Result' : 'ð Race Result â ' + gpName,
          body:  winner ? (winner + ' wins ' + (isSprint ? 'the Sprint!' : gpName + '!')) : (gpName + ' complete'),
          url:   '/dashboard',
        });
      } else if (isPractice) {
        const fastest = getP1Driver(newState);
        notifications.push({
          title: 'â ' + sessionName + ' Complete',
          body:  fastest ? (fastest + ' leads the times at ' + gpName) : (gpName + ' ' + sessionName + ' finished'),
          url:   '/dashboard',
        });
      } else {
        notifications.push({
          title: 'â ' + sessionName + ' Finished',
          body: gpName + ' â ' + sessionName + ' complete',
          url:  '/dashboard',
        });
      }
    }
  }

  // ââ Rain / weather ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const prevRain = prevState.WeatherData && prevState.WeatherData.Rainfall === '1';
  const newRain  = newState.WeatherData  && newState.WeatherData.Rainfall  === '1';
  if (!prevRain && newRain) {
    notifications.push({ title: 'ðÏï¸ Rain!', body: 'It has started raining at the circuit â tyre change incoming?', url: '/dashboard' });
  } else if (prevRain && !newRain) {
    notifications.push({ title: 'âï¸ Rain Stopped', body: 'Track drying â conditions improving.', url: '/dashboard' });
  }

  // ââ Race control messages âââââââââââââââââââââââââââââââââââââââââââââââââ
  const prevMsgs = (prevState.RaceControlMessages && prevState.RaceControlMessages.Messages) || [];
  const newMsgs  = (newState.RaceControlMessages  && newState.RaceControlMessages.Messages)  || [];
  if (newMsgs.length > prevMsgs.length) {
    const latest = newMsgs[newMsgs.length - 1];
    const msg    = (latest && latest.Message) ? latest.Message : '';
    if (latest) {
      if (latest.Flag === 'RED') {
        notifications.push({ title: 'ð´ Red Flag!', body: msg.substring(0, 100) || 'Session red flagged.', url: '/dashboard' });
      } else if (latest.Category === 'SafetyCar') {
        notifications.push({ title: 'ð Race Control', body: msg.substring(0, 100) || 'Safety Car event.', url: '/dashboard' });
      } else if (latest.Flag === 'CHEQUERED') {
        notifications.push({ title: 'ð Chequered Flag', body: msg.substring(0, 100) || 'Race finished!', url: '/dashboard' });
      } else if (/penalty|investigation|under investigation/i.test(msg)) {
        notifications.push({ title: 'ð Race Control', body: msg.substring(0, 100), url: '/dashboard' });
      }
    }
  }

  return notifications;
}

async function sendNotifications(notifications) {
  if (notifications.length === 0) return;
  const payload     = JSON.stringify(notifications[0]);
  const pushOptions = { TTL: PUSH_TTL_SECONDS };
  const dead        = [];

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

  if (dead.length > 0) {
    for (const endpoint of dead) {
      subscriptions.delete(endpoint);
      console.log('Removed expired subscription:', endpoint);
    }
    saveSubscriptions();
  }
}

// ââ Pre-session reminders via OpenF1 API âââââââââââââââââââââââââââââââââââââ
// Checks every minute for sessions starting within the next 10 minutes.
// Fires a push reminder once per session_key so it never double-fires.
const announcedSessions = new Set();

async function checkUpcomingSessions() {
  if (subscriptions.size === 0) return;
  try {
    const now     = new Date();
    const in12min = new Date(now.getTime() + 12 * 60 * 1000);
    const in8min  = new Date(now.getTime() + 8  * 60 * 1000);

    // Fetch sessions starting between 8 and 12 minutes from now
    const url = OPENF1_URL + '/sessions?date_start>' + in8min.toISOString() + '&date_start<' + in12min.toISOString();
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return;

    const sessions = await res.json();
    if (!Array.isArray(sessions)) return;

    for (const session of sessions) {
      const key = session.session_key;
      if (!key || announcedSessions.has(key)) continue;

      announcedSessions.add(key);

      const sN[Re   = session.session_name || 'Session';       // e.g. "Race", "Qualifying", "Practice 1"
      const circuit = session.circuit_short_name || session.country_name || 'the circuit';
      const minsOut = Math.round((new Date(session.date_start) - now) / 60000);

      const sessionEmoji = {
        'Race':        'ð',
        'Qualifying':  '>â±ï¸',
        'Sprint':      'ðï¸',
        'Practice 1':  'ð§',
        'Practice 2':  'ð§',
        'Practice 3':  'ð§',
      }[sName] || 'ð';

      await sendNotifications([{
        title: sessionEmoji + ' ' + sName + ' in ~10 mins',
        body:  sName + ' at ' + circuit + ' starts in around ' + minsOut + ' minutes â open the app!',
        url:   '/dashboard',
      }]);

      console.log('Pre-session reminder sent for', sName, 'at', circuit);
    }

    // Keep the set from growing unboundedly
    if (announcedSessions.size > 100) announcedSessions.clear();
  } catch (e) {
    // OpenF1 failures are non-fatal
    console.log('Session check error:', e.message);
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
      console.log('Received initial state â warmup for', WARMUP_MS, 'ms');
      setTimeout(() => {
        readyToNotify = true;
        console.log('Warmup complete â notifications enabled');
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

// ââ REST endpoints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
  saveSubscriptions();
  console.log('New subscription registered. Total:', subscriptions.size);
  res.status(201).json({ message: 'Subscribed successfully' });
});

app.delete('/subscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }
  subscriptions.delete(endpoint);
  saveSubscriptions();
  console.log('Subscription removed. Total:', subscriptions.size);
  res.json({ message: 'Unsubscribed successfully' });
});

// ââ Tweet cache âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
let tweetCache       = { tweets: [], fetchedAt: 0 };
const TWEET_CACHE_MS = 30 * 60 * 1000;

function parseTweetsFromHtml(html) {
  const tweets  = [];
  const itemRe  = /<li[^>]+data-tweet-id="(\d+)"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const id        = m[1];
    const inner     = m[2];
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

acync function fetchTweetsFromCDN() {
  const cdnUrl = 'https://cdn.syndication.twimg.com/timeline/profile?screen_name=f1_naija&count=20&lang=en&callback=f1nCallback';
  try {
    const res  = await fetch(cdnUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept':          'text/javascript, application/javascript, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://twitter.com/',
        'Origin':          'https://twitter.com',
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    if (body && body.trim()) {
      const match   = body.match(/^[^(]+\(([\s\S]*)\)\s*;?\s*$/);
      const jsonStr = match ? match[1] : body;
      const data    = JSON.parse(jsonStr);
      const htmlBody = data.body || '';
      if (htmlBody) {
        const tweets = parseTweetsFromHtml(htmlBody);
        if (tweets.length > 0) return tweets;
      }
    }
  } catch (e) {
    console.log('CDN JSONP error: ' + e.message);
  }

  const synUrl = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/f1_naija?lang=en';
  try {
    const res  = await fetch(synUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept':          'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://twitter.com/',
      },
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.text();
    if (res.ok && body) {
      const tweets = parseTweetsFromHtml(body);
      if (tweets.length > 0) return tweets;
    }
  } catch (e) {
    console.log('Syndication error: ' + e.message);
  }
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
      if (!res.ok) continue;
      const xml   = await res.text();
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const linkM   = itemXml.match(/<link>(.*?)<\/link>/);
        const dateM   = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
        const descM   = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
        const idM     = linkM && linkM[1].match(/\/status\/(\d+)/);
        if (!idM) continue;
        const text = (descM ? descM[1] : '')
          .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
        items.push({ id: idM[1], text, created_at: new Date(dateM ? dateM[1] : '').toISOString() });
      }
      if (items.length > 0) return items;
    } catch (e) {
      console.log('Nitter ' + instance + ' failed: ' + e.message);
    }
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

// ââ Test endpoint âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.get('/test-push', async (req, res) => {
  const TEST_SECRET = process.env.TEST_PUSH_SECRET || 'f1naija-test';
  if (req.query.secret !== TEST_SECRET) {
    return res.status(401).json({ error: 'Invalid secret.' });
  }
  if (subscriptions.size === 0) {
    return res.status(200).json({ sent: 0, message: 'No subscribers registered yet.' });
  }
  await sendNotifications([{
    title: 'ðï¸ F1 Naija Test',
    body:  'Push notifications are working! Background delivery confirmed.',
    url:   '/dashboard',
  }]);
  res.json({ sent: subscriptions.size, message: 'Test push sent to ' + subscriptions.size + ' subscriber(s)' });
});

// ââ Start âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.listen(PORT, () => {
  console.log('Push service running on port ' + PORT);
  connectToRealtime();
  // Check for upcoming sessions every minute
  setInterval(checkUpcomingSessions, 60 * 1000);
  checkUpcomingSessions(); // Run once immediately on startup
});
