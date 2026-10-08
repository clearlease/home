// Date-based expiry for time-limited content (events, news). See docs/events.md.
// Days are 'YYYY-MM-DD' strings and compare as strings, so a malformed date
// (e.g. '7.10.2026') would silently never expire: checkDay refuses it.
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function checkDay(value, where) {
  if (value != null && !DAY.test(value)) throw new Error(`${where}: "${value}" is not a date in YYYY-MM-DD format`);
  return value;
}

// until: last day shown (inclusive). from: first day shown (inclusive). day: the build day.
export function isLive({ until, from } = {}, day, where = 'expiry') {
  checkDay(day, `${where} (build day)`);
  if (checkDay(until, `${where} until`) && day > until) return false;
  if (checkDay(from, `${where} from`) && day < from) return false;
  return true;
}
