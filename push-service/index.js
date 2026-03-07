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

// Start server
app.listen(PORT, () => {
  console.log(`Push service running on port ${PORT}`);
  connectToRealtime();
});
