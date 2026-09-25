/* Public storefront configuration. NEVER add a Tebex private key, secret, or API password.
 * Package links and media checked against the MikeScripts store on 2026-09-25.
 * Pricing is deliberately NOT copied into this file: it comes from Tebex or is omitted.
 * For aircraft: add your own cover/media, then add verified Tebex variants when released.
 */
window.MS_CONFIG = {
  brand: 'MikeScripts',
  storeUrl: 'https://mikescripts.tebex.io',
  discordUrl: 'https://discord.gg/bBbZk5HzPK',
  publicToken: '',
  heroVideo: 'https://www.youtube.com/watch?v=pgvk9rsA2ms',
  products: [
    {
      slug: 'flight', category: 'aviation', code: 'MS FLIGHT', name: 'All-In-One Flight Simulator',
      headline: 'The sky is only the beginning.',
      summary: 'Pilot careers, cockpit systems and a connected aviation world. More than a flight job.',
      description: 'Build an aviation career with cockpit systems, pilot training, aircraft ownership and air traffic control in one resource.',
      tags: ['ESX', 'QBCore', 'Qbox'],
      features: ['Cockpit avionics, autopilot and autoland', 'Pilot training and certification', 'Aircraft ownership and company management', 'Air traffic control, radar and flight plans'],
      requirements: 'The listing specifies oxmysql, ox_lib, ox_inventory and ESX, QBCore or Qbox. Check the current Tebex listing before purchase.',
      variants: [{id: '7324328', label: 'One-time purchase', type: 'single'}, {id: '7472845', label: 'Monthly subscription', type: 'subscription'}],
      cover: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/740bc080dc970ad3293076e6a704241ce3e9e4ff.png',
      media: [{type: 'youtube', url: 'https://www.youtube.com/watch?v=pgvk9rsA2ms', label: 'Video showcase'}, {type: 'youtube', url: 'https://youtu.be/EXTJy9Ej5Gk', label: 'Aviation overview'}, {type: 'image', url: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/19923446f797aa54647be5fcfb33041961af262a.gif', label: 'Gameplay 01'}, {type: 'image', url: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/25924e9723b88e882b49880ff64601f7be66e5bb.gif', label: 'Gameplay 02'}]
    },
    {
      slug: 'wrecker', category: 'vehicles', code: 'MS HWYWRK', name: 'Heavy Rotator Wrecker',
      headline: 'Built for the big recoveries.',
      summary: 'A working rotator, three winches and hands-on controls. Take charge of the recovery.',
      description: 'A heavy recovery vehicle with working equipment and script-driven controls. Operate the boom, connect a hook and use the wheel-lift from the truck’s own panels.',
      tags: ['Standalone', 'OneSync', 'ESX / QB / Qbox jobs'],
      features: ['360° boom rotation with two-stage extension', 'Three winches with carryable hooks', 'Functional outriggers and wheel-lift', 'Two rear control panels and synchronized equipment'],
      requirements: 'Requires a FiveM server with OneSync. No framework is required; ESX, QBCore and Qbox support is used for optional job permissions. Includes the vehicle and its scripts.',
      variants: [{id: '7692812', label: 'One-time purchase', type: 'single'}],
      cover: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/c9c7444cd25f58aa414cc2c130a5181cebce7445.png',
      media: [{type: 'image', url: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/e2c11bf6c35e9829b4d21756b02a7535e38b0592.png', label: 'Equipment showcase'}]
    },
    {
      slug: 'police', category: 'police', code: 'MS HELIPOL', name: 'Police Helicopter System',
      headline: 'Eyes above. Control below.',
      summary: 'Put your air support team in control with a camera, spotlight, target lock and rappel.',
      description: 'A helicopter camera and spotlight workflow for air support, with plate recognition, target tracking and rappelling.',
      tags: ['ESX', 'QBCore', 'Qbox', 'Standalone'],
      features: ['Stabilized camera with zoom and vision modes', 'Replicated spotlight and target tracking', 'Vehicle plate identification', 'Rappelling with server-side permission checks'],
      requirements: 'Supports ESX, QBCore, Qbox and standalone ACE permissions. Confirm your helicopter models and current requirements on the Tebex listing.',
      variants: [{id: '7426329', label: 'One-time purchase', type: 'single'}],
      cover: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/6d18710e3df45d8c3b3f053b0cab96e93691419f.png',
      media: [{type: 'image', url: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/98838f950c4cf60125c651b82266227f6579854a.gif', label: 'In-game showcase'}]
    },
    {
      slug: 'fire', category: 'fire', code: 'MS FIRE', name: 'Advanced Fire System',
      headline: 'Every alarm starts a story.',
      summary: 'Connected alarm panels, sprinklers and inspections. Give fire crews a complete workflow.',
      description: 'Connect buildings, alarm devices and firefighter tasks through configurable zones, working panels and inspection tools.',
      tags: ['ESX', 'QBCore', 'Qbox'],
      features: ['Interactive alarm panels and manual pull stations', 'Synchronized strobes and working sprinklers', 'Firefighter inspections and device maintenance', 'In-game building and zone setup'],
      requirements: 'The listing specifies oxmysql, ox_target and ESX, QBCore or Qbox. ox_inventory is recommended. Product artwork does not imply that the illustrated fire truck is included.',
      variants: [{id: '7437723', label: 'One-time purchase', type: 'single'}],
      cover: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/4e9440f3fb6e8f5c1f9625d7059f7d7eb36a78cd.png',
      media: [{type: 'image', url: 'https://dunb17ur4ymx4.cloudfront.net/packages/images/33a08d748f7492a8a89547c4d49322dfee881edb.gif', label: 'In-game showcase'}]
    }
  ],
  aircraft: [
    {slug: 'ms100', category: 'aircraft', code: 'MS100 MAX', name: 'MS100 MAX', headline: 'Your next departure.', summary: 'A custom passenger aircraft. Step into the cabin and make the journey part of the story.', description: 'A custom MikeScripts passenger aircraft for FiveM with a walkable interior.', tags: ['Custom aircraft', 'Walkable interior'], features: ['Custom MikeScripts aircraft', 'Walkable passenger interior'], requirements: 'Contact MikeScripts for availability, pricing, installation and compatibility. This aircraft is not advertised as included with the Flight Simulator.', cover: '', media: [], variants: []},
    {slug: 'ms8000', category: 'aircraft', code: 'MS8000', name: 'MS8000', headline: 'A different class of flight.', summary: 'A custom luxury jet. A walkable cabin that makes the interior part of the experience.', description: 'A custom luxury jet for FiveM, with a walkable cabin interior.', tags: ['Custom aircraft', 'Luxury cabin'], features: ['Custom luxury jet', 'Walkable cabin interior'], requirements: 'Contact MikeScripts for availability, pricing, installation and compatibility. This aircraft is not advertised as included with the Flight Simulator.', cover: '', media: [], variants: []}
  ]
};
