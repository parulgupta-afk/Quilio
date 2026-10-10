/**
 * Lightweight structured logger — no secrets, no full prompts.
 */
function log(level, event, meta = {}) {
  const safe = { ...meta };
  delete safe.password;
  delete safe.token;
  delete safe.authorization;
  delete safe.prompt;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...safe,
  });
  if (level === 'error') console.error(line);
  else console.log(line);
}

module.exports = {
  info: (event, meta) => log('info', event, meta),
  warn: (event, meta) => log('warn', event, meta),
  error: (event, meta) => log('error', event, meta),
};
