/**
 * Production and development CORS origin configuration.
 * Supports CLIENT_URL, CORS_ORIGIN, standard local development ports,
 * and production Vercel deployment (https://quilio-olive.vercel.app).
 */

function getAllowedOrigins() {
  const envOrigins = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((val) => val.split(',').map((s) => s.trim()))
    .map((origin) => origin.replace(/\/+$/, ''))
    .filter(Boolean);

  const defaultOrigins = [
    'https://quilio-olive.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  return Array.from(new Set([...envOrigins, ...defaultOrigins]));
}

function isOriginAllowed(origin) {
  if (!origin) return true; // Allow non-browser requests (Postman, curl, server-to-server)
  const normalized = origin.trim().replace(/\/+$/, '');
  const allowed = getAllowedOrigins();
  if (allowed.includes(normalized)) return true;

  // Allow Vercel preview deployments for Quilio (e.g., https://quilio-git-*.vercel.app)
  if (/^https:\/\/quilio(-[a-z0-9_-]+)?\.vercel\.app$/i.test(normalized)) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
};

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
  corsOptions,
};
