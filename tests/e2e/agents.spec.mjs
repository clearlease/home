// Search engines and AI systems may read everything; scrapers nothing. /agent.md is the curated summary.
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

const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'Google-Extended', 'Applebot-Extended', 'PerplexityBot', 'Perplexity-User', 'meta-externalagent', 'Amazonbot', 'CCBot', 'MistralAI-User', 'DuckAssistBot'];
const SEARCH = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot'];
const SCRAPERS = ['Bytespider', 'img2dataset', 'ImagesiftBot', 'Timpibot', 'Scrapy'];

test('robots.txt: search engines and AI systems read everything, scrapers nothing', async ({ request }) => {
  const groups = parseRobots(await (await request.get('/robots.txt')).text());
  const paths = ALL.map((r) => r.path).concat(['/agent.md', '/llms.txt', '/media/logo-garbe.webp']);
  const problems = [];
  for (const agent of [...SEARCH, ...AI]) for (const p of paths) if (!allowed(groups, agent, p)) problems.push(`${agent} blocked from ${p}`);
  for (const agent of SCRAPERS) for (const p of paths) if (allowed(groups, agent, p)) problems.push(`${agent} allowed on ${p}`);
  expect(problems).toEqual([]);
});

test('agent.md and llms.txt are served and identical', async ({ request }) => {
  const a = await request.get('/agent.md');
  const l = await request.get('/llms.txt');
  expect(a.status()).toBe(200);
  expect(l.status()).toBe(200);
  const text = await a.text();
  expect(text).toContain('hello@clearlea.se');
  expect(await l.text()).toBe(text);
});

test('every page links to agent.md in the footer and in <head>', async ({ page }) => {
  for (const { path, lang } of ALL) {
    await page.goto(path);
    await expect(page.locator('footer a[href="/agent.md"]'), path).toHaveText(lang === 'de' ? 'Für KI-Agenten' : 'For AI agents');
    await expect(page.locator('link[rel=alternate][href="/agent.md"]'), path).toHaveCount(1);
  }
});
