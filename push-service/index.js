const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const EventSource = require('eventsource');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@f1naija.com';
const REALTIME_URL = process.env.REALTIME_URL || 'https://realtime.railway.internal';
const PORT = process.env.PORT || 3001;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID keys! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// In-memory subscription store: endpoint -> subscription
const subscriptions = new Map();
let lastState = null;

function detectEvents(prevState, newState) {
  const notifications = [];
  if (!prevState || !newState) return notifications;

  // Track status changes
  const prevStatus = prevState.trackStatus?.status;
  const newStatus = newState.trackStatus?.status;
  if (prevStatus !== newStatus) {
    if (newStatus === '4') {
      notifications.push({ title: '\uD83D\uDFE1 Safety Car', body: 'Safety Car deployed on track' });
    } else if (newStatus === '5') {
      notifications.push({ title: '\uD83D\uDD34 Red Flag', body: 'Session has been red flagged!' });
    } else if (newStatus === '6') {
      notifications.push({ title: '\uD83D\uDFE0 Virtual Safety Car', body: 'VSC deployed on track' });
    } else if (newStatus === '1' && (prevStatus === '4' || prevStatus === '6' || prevStatus === '5')) {
      notifications.push({ title: '\uD83D\uDFE2 Green Flag', body: 'Track is clear — racing resumed!' });
    }
  }

  // Session status changes
  const prevSession = prevState.sessionInfo?.status;
  const newSession = newState.sessionInfo?.status;
  if (prevSession !== newSession) {
    const sessionName = newState.sessionInfo?.name || 'Session';
    if (newSession === 'Started') {
      notifications.push({ title: '\uD83C\uDFC1 Session Started', body: sessionName + ' is underway!' });
    } else if (newSession === 'Finished') {
      notifications.push({ title: '\uD83C\uDFC1 Session Finished', body: sessionName + ' has ended' });
    }
  }

  // Rain
  const prevRaining = prevState.weatherData?.isRaining;
  const newRaining = newState.weatherData?.isRaining;
  if (!prevRaining && newRaining) {
    notifications.push({ title: '\uD83C\uDF27\uFE0F Rain!', body: "It's starting to rain at the circuit" });
  }

  // Fastest lap
  const prevFL = prevState.timingData?.fastestLap?.driverNumber;
  const newFL = newState.timingData?.fastestLap?.driverNumber;
  if (newFL && prevFL !== newFL) {
    const driver = (newState.driverList || {})[newFL];
    const name = driver ? (driver.firstName + ' ' + driver.lastName) : ('Driver #' + newFL);
    const lapTime = newState.timingData?.fastestLap?.lapTime || '';
    notifications.push({ title: '\u26A1 Fastest Lap', body: name + ' sets fastest lap' + (lapTime ? ' — ' + lapTime : '') });
  }

  return notifications;
}

async function sendPushToAll(notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/pwa-icon.png',
    badge: '/pwa-icon.png',
    url: '/dashboard',
  });

  const toRemove = [];
  for (const [endpoint, subscription] of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        toRemove.push(endpoint);
      } else {
        console.error('Push failed:', err.message);
      }
    }
  }
  toRemove.forEach(ep => subscriptions.delete(ep));
  if (toRemove.length) console.log('Removed ' + toRemove.length + ' expired subscriptions');
}

function connectToRealtime() {
  const url = REALTIME_URL + '/api/realtime';
  console.log('Connecting to SSE:', url);
  const es = new EventSource(url);

  es.addEventListener('initial', (e) => {
    try {
      lastState = JSON.parse(e.data);
      console.log('Initial state received, ' + subscriptions.size + ' subscribers');
    } catch (err) {
      console.error('Failed to parse initial:', err.message);
    }
  });

  es.addEventListener('update', async (e) => {
    try {
      const update = JSON.parse(e.data);
      const prevState = lastState ? JSON.parse(JSON.stringify(lastState)) : null;
      // Merge update into state
      lastState = Object.assign({}, lastState);
      for (const key of Object.keys(update)) {
        if (update[key] !== null && typeof update[key] === 'object' && !Array.isArray(update[key]) && lastState[key] && typeof lastState[key] === 'object') {
          lastState[key] = Object.assign({}, lastState[key], update[key]);
        } else {
          lastState[key] = update[key];
        }
      }
      if (subscriptions.size > 0) {
        const notifications = detectEvents(prevState, lastState);
        for (const notif of notifications) {
          console.log('Sending notification:', notif.title, '— to', subscriptions.size, 'subscribers');
          await sendPushToAll(notif);
        }
      }
    } catch (err) {
      console.error('Failed to process update:', err.message);
    }
  });

  es.onerror = () => {
    console.error('SSE connection lost, reconnecting in 5s...');
    es.close();
    setTimeout(connectToRealtime, 5000);
  };
}

// Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', subscribers: subscriptions.size, hasState: !!lastState });
});

app.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }
  subscriptions.set(subscription.endpoint, subscription);
  console.log('New subscriber. Total:', subscriptions.size);
  res.status(201).json({ message: 'Subscribed successfully' });
});

app.delete('/subscribe', (req, res) => {
  const { endpoint } = req.body || {};
  if (endpoint) subscriptions.delete(endpoint);
  res.json({ message: 'Unsubscribed' });
});

app.listen(PORT, () => {
  console.log('F1 Push Service on port ' + PORT);
  connectToRealtime();
});
