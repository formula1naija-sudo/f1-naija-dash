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

// ── Persistent subscription store ────────────────────────────────────────────
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

// ── Helper: randomly pick one item from an array ──────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Message variation pools ───────────────────────────────────────────────────
const VARIATIONS = {
  trackClear: [
    { title: '🟢 Track Clear',       body: 'Green flag — racing resumed!' },
    { title: '🟢 Green Flag!',        body: 'Track is clear, full racing speed!' },
    { title: '🟢 Racing Resumes',     body: "We're back to full racing conditions!" },
    { title: '🟢 Go Go Go!',          body: 'Green flag out — drivers pushing now.' },
  ],
  yellowFlag: [
    { title: '🟡 Yellow Flag',        body: 'Yellow flag conditions on track — no overtaking.' },
    { title: '🟡 Caution Out',        body: 'Yellows shown — something happening on track.' },
    { title: '🟡 Yellow Flag Zone',   body: 'Drivers must slow — yellow flag sector active.' },
  ],
  safetyCar: [
    { title: '🚗 Safety Car',         body: 'Safety car deployed on track.' },
    { title: '🚗 SC Out!',            body: "Safety car's out — field bunching up." },
    { title: '🚗 Safety Car Deployed', body: 'Neutralised! Safety car leads the field.' },
    { title: '🚗 Safety Car',         body: 'SC deployed — strategy window opening for teams.' },
  ],
  redFlag: [
    { title: '🔴 Red Flag!',          body: 'Session has been red flagged.' },
    { title: '🔴 RED FLAG!',          body: 'Session stopped — red flag shown!' },
    { title: '🔴 Session Suspended',  body: 'Red flag! Session has been suspended.' },
    { title: '🔴 Red Flag!',          body: 'Action halted — stewards have red flagged the session.' },
  ],
  vsc: [
    { title: '⚠️ Virtual Safety Car', body: 'VSC deployed — no overtaking.' },
    { title: '⚠️ VSC',                body: 'Virtual Safety Car! Drivers must slow down.' },
    { title: '⚠️ VSC Out',            body: 'VSC period in effect — gaps being maintained.' },
  ],
  vscEnding: [
    { title: '⚠️ VSC Ending',         body: 'VSC period ending — prepare to push!' },
    { title: '⚠️ VSC Almost Over',    body: 'VSC ending soon — drivers ready to attack!' },
    { title: '⚠️ VSC Ending',         body: "VSC about to be withdrawn — it's on!" },
  ],
  sessionStarted: (sessionName, gpName) => [
    { title: '🏁 ' + sessionName + ' — LIVE',  body: sessionName + ' at ' + gpName + ' is underway!' },
    { title: '🏁 ' + sessionName + ' Starts!', body: "We're live! " + sessionName + ' at ' + gpName + ' has begun.' },
    { title: '🚦 Lights Out!',                 body: sessionName + ' is GO at ' + gpName + '!' },
    { title: '🏁 SESSION LIVE',                body: gpName + ' ' + sessionName + ' — action underway now!' },
  ],
  qualiPole: (pole, top3, sessionName, gpName) => [
    {
      title: '🏆 ' + sessionName + ' Results',
      body:  pole + ' takes Pole Position!' + (top3 ? ' Top 3: ' + top3 : ''),
    },
    {
      title: '🥇 POLE! ' + pole,
      body:  pole + ' starts from P1 at ' + gpName + '!' + (top3 ? ' Top 3: ' + top3 : ''),
    },
    {
      title: '🏆 Qualifying Done',
      body:  pole + " nabs pole! It's " + (top3 || pole) + ' for ' + gpName + '.',
    },
    {
      title: '⏱️ Pole: ' + pole,
      body:  pole + ' is on pole for ' + gpName + '!' + (top3 ? ' Full top 3: ' + top3 : ''),
    },
  ],
  qualiNoData: (gpName) => [
    { title: '🏁 Qualifying Complete', body: gpName + ' qualifying done — check the results!' },
    { title: '✅ Qualifying Over',     body: gpName + ' qualifying wrapped up.' },
  ],
  raceWinner: (winner, gpName) => [
    { title: '🏆 Race Result — ' + gpName,    body: winner + ' wins ' + gpName + '!' },
    { title: '🥇 ' + winner + ' WINS!',       body: winner + ' takes victory at ' + gpName + '!' },
    { title: '🏆 ' + gpName + ' Result',      body: winner + " crosses the line first — " + gpName + " winner!" },
    { title: '🎉 WINNER: ' + winner,          body: winner + ' wins the ' + gpName + '! What a race.' },
  ],
  raceNoData: (gpName) => [
    { title: '🏁 Race Complete',              body: gpName + ' is done — check the final standings!' },
    { title: '✅ ' + gpName + ' Finished',    body: 'Race over at ' + gpName + '.' },
  ],
  sprintWinner: (winner) => [
    { title: '🏎️ Sprint Result',             body: winner + ' wins the Sprint!' },
    { title: '🥇 Sprint: ' + winner,         body: winner + ' takes the Sprint victory!' },
    { title: '🏎️ Sprint Done',               body: winner + " claims the Sprint win — that's P1!" },
  ],
  sprintNoData: () => [
    { title: '🏎️ Sprint Finished',           body: 'Sprint race is done!' },
  ],
  practiceComplete: (fastest, sessionName, gpName) => [
    { title: '✅ ' + sessionName + ' Complete', body: fastest + ' leads the times at ' + gpName + '.' },
    { title: '🔧 ' + sessionName + ' Done',    body: fastest + ' fastest in ' + sessionName + ' at ' + gpName + '.' },
    { title: '✅ ' + sessionName,              body: gpName + ' ' + sessionName + ' wrapped — ' + fastest + ' P1.' },
    { title: '🔧 Practice Wrap',              body: fastest + ' sets the pace in ' + sessionName + ' at ' + gpName + '.' },
  ],
  practiceNoData: (sessionName, gpName) => [
    { title: '✅ ' + sessionName + ' Done',    body: gpName + ' ' + sessionName + ' complete.' },
    { title: '🔧 ' + sessionName + ' Finished', body: 'All done for ' + sessionName + ' at ' + gpName + '.' },
  ],
  rainStart: [
    { title: '🌧️ Rain!',            body: 'It has started raining at the circuit — tyre change incoming?' },
    { title: '🌧️ WET CONDITIONS',   body: "Rain's falling at the track — expect strategy chaos!" },
    { title: '🌧️ It\'s Raining!',  body: 'Weather change at the circuit — could shuffle the order!' },
    { title: '🌧️ Rain Alert',       body: 'Wet weather arriving — watch for inter or wet tyres.' },
  ],
  rainStop: [
    { title: '☀️ Rain Stopped',      body: 'Track drying — conditions improving.' },
    { title: '☀️ Drying Out',        body: 'Rain has stopped — track should improve quickly.' },
    { title: '☀️ Clearing Up',       body: 'No more rain — dry conditions returning to the circuit.' },
    { title: '☀️ Rain Gone',         body: 'Weather clearing up — slicks incoming soon?' },
  ],
  preSession: (emoji, sName, circuit, minsOut) => [
    {
      title: emoji + ' ' + sName + ' in ~10 mins',
      body:  sName + ' at ' + circuit + ' starts in around ' + minsOut + ' minutes — open the app!',
    },
    {
      title: emoji + ' ' + sName + ' Soon!',
      body:  'About ' + minsOut + ' minutes until ' + sName + ' at ' + circuit + '. Get ready!',
    },
    {
      title: emoji + ' Almost Time — ' + sName,
      body:  sName + ' at ' + circuit + ' kicking off in ~' + minsOut + ' mins. Don\'t miss it!',
    },
    {
      title: emoji + ' ' + minsOut + ' Mins to ' + sName,
      body:  circuit + ' ' + sName + ' is nearly here — tap to follow live!',
    },
  ],
};

// ── Helper: get P1 driver display name from state ────────────────────────────
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

// ── Helper: build qualifying summary (top 3) ─────────────────────────────────
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

// ── Detect push-worthy events by diffing prevState vs newState ───────────────
function detectEvents(prevState, newState) {
  const notifications = [];
  if (!prevState || !newState) return notifications;

  const sessionName = (newState.SessionInfo && newState.SessionInfo.Name) || 'Session';
  const sessionType = (newState.SessionInfo && newState.SessionInfo.Type) || '';
  const gpName      = (newState.SessionInfo && newState.SessionInfo.Meeting && newState.SessionInfo.Meeting.Name)
                      || sessionName;

  // ── Track status ──────────────────────────────────────────────────────────
  // TrackStatus.Status: "1"=Clear "2"=Yellow "4"=SafetyCar "5"=Red "6"=VSC "7"=VSCEnding
  const prevTrack = prevState.TrackStatus && prevState.TrackStatus.Status;
  const newTrack  = newState.TrackStatus  && newState.TrackStatus.Status;
  if (prevTrack !== newTrack && newTrack) {
    const pools = {
      '1': VARIATIONS.trackClear,
      '2': VARIATIONS.yellowFlag,
      '4': VARIATIONS.safetyCar,
      '5': VARIATIONS.redFlag,
      '6': VARIATIONS.vsc,
      '7': VARIATIONS.vscEnding,
    };
    const pool = pools[newTrack];
    if (pool) notifications.push({ ...pick(pool), url: '/dashboard' });
  }

  // ── Session status ────────────────────────────────────────────────────────
  const prevSession = prevState.SessionStatus && prevState.SessionStatus.Status;
  const newSession  = newState.SessionStatus  && newState.SessionStatus.Status;

  if (prevSession !== newSession && newSession) {
    if (newSession === 'Started') {
      notifications.push({
        ...pick(VARIATIONS.sessionStarted(sessionName, gpName)),
        url: '/dashboard',
      });
    } else if (newSession === 'Finished' || newSession === 'Finalised') {
      const isQualifying = /qualifying/i.test(sessionType);
      const isRace       = /^race$/i.test(sessionType) || /^sprint$/i.test(sessionType);
      const isSprint     = /sprint/i.test(sessionType);
      const isPractice   = /practice/i.test(sessionType);

      if (isQualifying) {
        const pole = getP1Driver(newState);
        const top3 = getQualiTop3(newState);
        const chosen = pole
          ? pick(VARIATIONS.qualiPole(pole, top3, sessionName, gpName))
          : pick(VARIATIONS.qualiNoData(gpName));
        notifications.push({ ...chosen, url: '/dashboard' });

      } else if (isSprint) {
        const winner = getP1Driver(newState);
        const chosen = winner
          ? pick(VARIATIONS.sprintWinner(winner))
          : pick(VARIATIONS.sprintNoData());
        notifications.push({ ...chosen, url: '/dashboard' });

      } else if (isRace) {
        const winner = getP1Driver(newState);
        const chosen = winner
          ? pick(VARIATIONS.raceWinner(winner, gpName))
          : pick(VARIATIONS.raceNoData(gpName));
        notifications.push({ ...chosen, url: '/dashboard' });

      } else if (isPractice) {
        const fastest = getP1Driver(newState);
        const chosen = fastest
          ? pick(VARIATIONS.practiceComplete(fastest, sessionName, gpName))
          : pick(VARIATIONS.practiceNoData(sessionName, gpName));
        notifications.push({ ...chosen, url: '/dashboard' });

      } else {
        notifications.push({
          title: '✅ ' + sessionName + ' Finished',
          body:  gpName + ' — ' + sessionName + ' complete',
          url:   '/dashboard',
        });
      }
    }
  }

  // ── Rain / weather ────────────────────────────────────────────────────────
  const prevRain = prevState.WeatherData && prevState.WeatherData.Rainfall === '1';
  const newRain  = newState.WeatherData  && newState.WeatherData.Rainfall  === '1';
  if (!prevRain && newRain) {
    notifications.push({ ...pick(VARIATIONS.rainStart), url: '/dashboard' });
  } else if (prevRain && !newRain) {
    notifications.push({ ...pick(VARIATIONS.rainStop), url: '/dashboard' });
  }

  // ── Race control messages ─────────────────────────────────────────────────
  const prevMsgs = (prevState.RaceControlMessages && prevState.RaceControlMessages.Messages) || [];
  const newMsgs  = (newState.RaceControlMessages  && newState.RaceControlMessages.Messages)  || [];
  if (newMsgs.length > prevMsgs.length) {
    const latest = newMsgs[newMsgs.length - 1];
    const msg    = (latest && latest.Message) ? latest.Message : '';
    if (latest) {
      if (latest.Flag === 'RED') {
        notifications.push({ ...pick(VARIATIONS.redFlag), body: msg.substring(0, 100) || pick(VARIATIONS.redFlag).body, url: '/dashboard' });
      } else if (latest.Category === 'SafetyCar') {
        notifications.push({ ...pick(VARIATIONS.safetyCar), body: msg.substring(0, 100) || pick(VARIATIONS.safetyCar).body, url: '/dashboard' });
      } else if (latest.Flag === 'CHEQUERED') {
        notifications.push({ title: '🏁 Chequered Flag', body: msg.substring(0, 100) || 'Race finished!', url: '/dashboard' });
      } else if (/penalty|investigation|under investigation/i.test(msg)) {
        notifications.push({ title: '📋 Race Control', body: msg.substring(0, 100), url: '/dashboard' });
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

// ── Pre-session reminders via OpenF1 API ─────────────────────────────────────
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

      const sName   = session.session_name || 'Session';       // e.g. "Race", "Qualifying", "Practice 1"
      const circuit = session.circuit_short_name || session.country_name || 'the circuit';
      const minsOut = Math.round((new Date(session.date_start) - now) / 60000);

      const sessionEmoji = {
        'Race':        '🏆',
        'Qualifying':  '⏱️',
        'Sprint':      '🏎️',
        'Practice 1':  '🔧',
        'Practice 2':  '🔧',
        'Practice 3':  '🔧',
      }[sName] || '🏁';

      const chosen = pick(VARIATIONS.preSession(sessionEmoji, sName, circuit, minsOut));
      await sendNotifications([{ ...chosen, url: '/dashboard' }]);

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

// ── Tweet cache ───────────────────────────────────────────────────────────────
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

async function fetchTweetsFromCDN() {
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

// ── Test endpoint ─────────────────────────────────────────────────────────────
app.get('/test-push', async (req, res) => {
  const TEST_SECRET = process.env.TEST_PUSH_SECRET || 'f1naija-test';
  if (req.query.secret !== TEST_SECRET) {
    return res.status(401).json({ error: 'Invalid secret.' });
  }
  if (subscriptions.size === 0) {
    return res.status(200).json({ sent: 0, message: 'No subscribers registered yet.' });
  }
  // Pick a random test message so even the test feels fresh
  const testMessages = [
    { title: '🏎️ F1 Naija Test',    body: 'Push notifications working! Background delivery confirmed.' },
    { title: '🏁 Notifications Live', body: "You're all set — F1 Naija will alert you when it matters." },
    { title: '✅ Push Test OK',       body: 'Background push is working perfectly. See you on race day!' },
    { title: '🚦 Systems Go!',        body: 'F1 Naija push notifications are active and ready.' },
  ];
  await sendNotifications([{ ...pick(testMessages), url: '/dashboard' }]);
  res.json({ sent: subscriptions.size, message: 'Test push sent to ' + subscriptions.size + ' subscriber(s)' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('Push service running on port ' + PORT);
  connectToRealtime();
  // Check for upcoming sessions every minute
  setInterval(checkUpcomingSessions, 60 * 1000);
  checkUpcomingSessions(); // Run once immediately on startup
});
