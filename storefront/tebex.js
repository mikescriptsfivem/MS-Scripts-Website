/* Tebex Headless API only. No Checkout API credentials or private keys. */
(function (root) {
  'use strict';
  const API = 'https://headless.tebex.io/api';
  function secureURL(value, hosts) {
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' || u.username || u.password) return '';
      if (hosts && !hosts.some(h => u.hostname === h || u.hostname.endsWith('.' + h))) return '';
      return u.href;
    } catch { return ''; }
  }
  class TebexClient {
    constructor(token, fetcher) {
      this.token = String(token || '').trim();
      this.fetcher = fetcher || root.fetch.bind(root);
      if (this.token && !/^[a-z0-9]{4}-[a-z0-9]{10,100}$/i.test(this.token)) throw new Error('Use a valid Tebex public token, never a private key.');
    }
    get enabled() { return Boolean(this.token); }
    async request(path, options = {}, account = true) {
      if (!this.enabled) throw new Error('On-site checkout is not configured. Please continue on Tebex.');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await this.fetcher(API + (account ? '/accounts/' + encodeURIComponent(this.token) : '') + path, {
          method: options.method || 'GET', signal: controller.signal, credentials: 'omit', cache: 'no-store',
          headers: {Accept: 'application/json', ...(options.body ? {'Content-Type': 'application/json'} : {})},
          ...(options.body ? {body: JSON.stringify(options.body)} : {})
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(typeof body.detail === 'string' ? body.detail : 'Tebex could not complete this request. Please try the hosted store.');
          error.status = response.status;
          throw error;
        }
        return body;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Tebex took too long to respond. Please try again or continue on Tebex.');
        throw error;
      } finally { clearTimeout(timer); }
    }
    async catalogue() { const body = await this.request('/packages'); return Array.isArray(body.data) ? body.data : []; }
    async createBasket(returnBase) {
      const u = new URL(returnBase);
      if (u.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(u.hostname)) throw new Error('Checkout requires a secure HTTPS website.');
      u.hash = ''; u.search = '';
      const body = await this.request('/baskets', {method: 'POST', body: {complete_url: u.href + '#checkout-complete', cancel_url: u.href + '#checkout-cancel', complete_auto_redirect: true}});
      const basket = body.data || body;
      if (!basket.ident) throw new Error('Tebex did not return a valid basket.');
      return basket;
    }
    async basket(ident) { const r = await this.request('/baskets/' + encodeURIComponent(ident)); return r.data || r; }
    async auth(ident, returnUrl) {
      const r = await this.request('/baskets/' + encodeURIComponent(ident) + '/auth?returnUrl=' + encodeURIComponent(returnUrl));
      const options = Array.isArray(r) ? r : Array.isArray(r.data) ? r.data : null;
      if (!options) throw new Error('Tebex returned an invalid authentication response. Please use the hosted store.');
      const providers = options.map(o => ({name: String(o?.name || 'account'), url: secureURL(o?.url, ['tebex.io', 'cfx.re', 'fivem.net'])})).filter(o => o.url);
      if (options.length && !providers.length) throw new Error('No trusted authentication link was returned. Please use the hosted store.');
      return providers;
    }
    async addPackage(ident, id) {
      if (!/^\d+$/.test(String(id))) throw new Error('Invalid product.');
      return this.request('/baskets/' + encodeURIComponent(ident) + '/packages', {method: 'POST', body: {package_id: String(id), quantity: 1}}, false);
    }
  }
  root.MSTebex = {TebexClient, secureURL};
  if (typeof module !== 'undefined') module.exports = root.MSTebex;
})(typeof window !== 'undefined' ? window : globalThis);
