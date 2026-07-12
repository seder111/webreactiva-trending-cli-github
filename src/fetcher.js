import * as cheerio from 'cheerio';
import * as cache from './cache.js';

const BASE_URL = 'https://github.com/trending';
const DEFAULT_TIMEOUT = 15_000;

function buildUrl(lang, since) {
  let url = BASE_URL;
  if (lang) url += `/${encodeURIComponent(lang.toLowerCase())}`;
  const params = new URLSearchParams();
  if (since && since !== 'daily') params.set('since', since);
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function parseNumber(text) {
  return parseInt(text.replace(/,/g, ''), 10) || 0;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`GitHub respondió con HTTP ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('La petición a GitHub tardó demasiado. Usa --timeout para aumentarlo.');
    }
    if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      throw new Error('No se pudo conectar con GitHub. Revisa tu conexión a internet.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchTrending({ lang, since, limit, timeout = DEFAULT_TIMEOUT }) {
  const cacheKey = JSON.stringify({ lang, since });
  const cached = cache.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const url = buildUrl(lang, since);
  const response = await fetchWithTimeout(url, timeout);
  const html = await response.text();
  const $ = cheerio.load(html);
  const repos = [];

  $('article.Box-row').each((i, el) => {
    if (limit && repos.length >= limit) return false;

    const $el = $(el);

    const $nameLink = $el.find('h2 a');
    const href = $nameLink.attr('href') || '';
    const name = href.replace(/^\//, '');

    const $desc = $el.find('p').first();
    const description = $desc.length ? $desc.text().trim() : null;

    const $lang = $el.find('[itemprop="programmingLanguage"]');
    const language = $lang.length ? $lang.text().trim() : null;

    const $starLink = $el.find('a[href$="/stargazers"]');
    let totalStars = 0;
    if ($starLink.length) {
      const raw = $starLink.text().trim();
      const nums = raw.match(/[\d,]+/);
      if (nums) totalStars = parseNumber(nums[0]);
    }

    const footerText = $el.find('.f6').text();
    const periodMatch = footerText.match(/([\d,]+)\s+stars?\s+(?:this\s+)?(week|month|today)/i);
    const periodStars = periodMatch ? parseNumber(periodMatch[1]) : 0;
    const periodLabel = periodMatch ? periodMatch[2] : null;

    repos.push({
      rank: repos.length + 1,
      name,
      description,
      language,
      totalStars,
      periodStars,
      periodLabel,
      url: `https://github.com${href}`,
    });
  });

  if (repos.length === 0) {
    throw new Error(
      'No se encontraron repositorios. ' +
      'GitHub puede haber cambiado su estructura HTML o el lenguaje indicado no tiene tendencias.'
    );
  }

  cache.set(cacheKey, repos);
  return repos.slice(0, limit);
}
