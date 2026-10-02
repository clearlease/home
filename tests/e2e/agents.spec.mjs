// AI agents may read only /agent.md (and /llms.txt). Search engines keep full access.
import { test, expect } from '@playwright/test';
import { ALL } from './routes.mjs';

// Minimal RFC 9309 matcher: pick the most specific matching group, longest matching rule wins,
// Allow wins ties; supports * and $ in paths.
function parseRobots(txt) {
  const groups = [];
  let cur = null, lastWasAgent = false;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const [k, ...rest] = line.split(':');
    const key = k.trim().toLowerCase(), val = rest.join(':').trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if (key === 'allow' || key === 'disallow') {
      cur?.rules.push({ allow: key === 'allow', path: val });
      lastWasAgent = false;
    } else lastWasAgent = false;
  }
  return groups;
}
function allowed(groups, agent, path) {
  const a = agent.toLowerCase();
  const group = groups.find((g) => g.agents.includes(a)) || groups.find((g) => g.agents.includes('*'));
  if (!group) return true;
  let best = null;
  for (const r of group.rules) {
    if (!r.path) continue;
    const re = new RegExp('^' + r.path.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (re.test(path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return best ? best.allow : true;
}

const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended', 'PerplexityBot', 'Perplexity-User', 'meta-externalagent', 'Amazonbot', 'Bytespider', 'CCBot', 'cohere-ai', 'MistralAI-User', 'DuckAssistBot'];
const SEARCH = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot'];

test('robots.txt: AI agents see only agent.md, search engines see everything', async ({ request }) => {
  const groups = parseRobots(await (await request.get('/robots.txt')).text());
  const paths = ALL.map((r) => r.path).concat(['/agent.md', '/llms.txt', '/media/logo-garbe.webp', '/agent.md.bak']);
  const problems = [];
  for (const agent of AI) for (const p of paths) {
    const want = p === '/agent.md' || p === '/llms.txt';
    if (allowed(groups, agent, p) !== want) problems.push(`${agent} ${want ? 'blocked from' : 'allowed on'} ${p}`);
  }
  for (const agent of SEARCH) for (const p of paths) if (!allowed(groups, agent, p)) problems.push(`${agent} blocked from ${p}`);
  expect(problems).toEqual([]);
});

test('agent.md and llms.txt are served and identical', async ({ request }) => {
  const a = await request.get('/agent.md');
  const l = await request.get('/llms.txt');
  expect(a.status()).toBe(200);
  expect(l.status()).toBe(200);
  const text = await a.text();
  expect(text).toContain('hello@clearlea.se');
  expect(text).toContain('/robots.txt');
  expect(await l.text()).toBe(text);
});

test('every page links to agent.md in the footer and in <head>', async ({ page }) => {
  for (const { path, lang } of ALL) {
    await page.goto(path);
    await expect(page.locator('footer a[href="/agent.md"]'), path).toHaveText(lang === 'de' ? 'Für KI-Agenten' : 'For AI agents');
    await expect(page.locator('link[rel=alternate][href="/agent.md"]'), path).toHaveCount(1);
  }
});
