'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {TebexClient,secureURL} = require('../storefront/tebex.js');
const token='test-0123456789012345678901234567890123456789';
const reply=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
test('trust only HTTPS URLs on exact domains or real subdomains',()=>{
 assert.equal(secureURL('javascript:alert(1)'), '');
 assert.equal(secureURL('http://checkout.tebex.io/test',['tebex.io']), '');
 assert.equal(secureURL('https://tebex.io.evil.example/test',['tebex.io']), '');
 assert.equal(secureURL('https://eviltebex.io/test',['tebex.io']), '');
 assert.equal(secureURL('https://user:pass@checkout.tebex.io/test',['tebex.io']), '');
 assert.equal(secureURL('https://checkout.tebex.io/test',['tebex.io']), 'https://checkout.tebex.io/test');
});
test('missing token performs no network request',async()=>{
 let called=false;const c=new TebexClient('',async()=>{called=true;});
 await assert.rejects(c.catalogue(),/not configured/);assert.equal(called,false);
});
test('private-key-shaped values are rejected',()=>{
 assert.throws(()=>new TebexClient('thisisaprivatekeywithoutpublicprefix',()=>{}),/public token/);
});
test('catalog data is checked and token is only in URL',async()=>{
 const c=new TebexClient(token,async(u,o)=>{assert.equal(u,`https://headless.tebex.io/api/accounts/${token}/packages`);assert.equal(o.headers.Authorization,undefined);return reply({data:[{id:123}]});});
 assert.equal((await c.catalogue())[0].id,123);
 await assert.rejects(new TebexClient(token,async()=>reply({error:'bad'})).catalogue(),/invalid catalog/);
});
test('creation strips unrelated URL query and hash',async()=>{
 const c=new TebexClient(token,async(u,o)=>{const b=JSON.parse(o.body);assert.equal(b.complete_url,'https://shop.example/storefront/#checkout-complete');assert.equal(b.cancel_url,'https://shop.example/storefront/#checkout-cancel');assert.equal(b.ip_address,undefined);return reply({data:{ident:'basket-test'}});});
 assert.equal((await c.createBasket('https://shop.example/storefront/?secret=no#anything')).ident,'basket-test');
 await assert.rejects(c.createBasket('http://shop.example/'),/HTTPS/);
});
test('authentication returnUrl is encoded and links are validated',async()=>{
 const c=new TebexClient(token,async(u)=>{assert.match(u,/returnUrl=https%3A%2F%2Fshop.example%2F%23checkout-auth/);return reply([{name:'FiveM',url:'https://ident.tebex.io/auth/123'}]);});
 assert.equal((await c.auth('basket','https://shop.example/#checkout-auth'))[0].name,'FiveM');
 await assert.rejects(new TebexClient(token,async()=>reply([{url:'https://evil.example'}])).auth('b','https://shop.example'),/trusted/);
 await assert.rejects(new TebexClient(token,async()=>reply({})).auth('b','https://shop.example'),/invalid/);
});
test('add uses unscoped basket API, quantity 1, never caller-controlled price',async()=>{
 const c=new TebexClient(token,async(u,o)=>{assert.equal(u,'https://headless.tebex.io/api/baskets/basket-id/packages');assert.equal(o.method,'POST');assert.deepEqual(JSON.parse(o.body),{package_id:'7324328',quantity:1});return reply({data:{}});});
 await c.addPackage('basket-id','7324328');await assert.rejects(c.addPackage('b','../123'),/Invalid/);
});
test('failed mutations are not retried automatically',async()=>{
 let calls=0;const c=new TebexClient(token,async()=>{calls++;return reply({detail:'Unavailable'},422);});
 await assert.rejects(c.addPackage('b','123'),e=>e.status===422&&e.message==='Unavailable');assert.equal(calls,1);
});
test('network errors and invalid basket responses fail visibly',async()=>{
 await assert.rejects(new TebexClient(token,async()=>{throw new Error('offline');}).catalogue(),/offline/);
 await assert.rejects(new TebexClient(token,async()=>reply({data:{}})).createBasket('https://shop.example'),/valid basket/);
});
