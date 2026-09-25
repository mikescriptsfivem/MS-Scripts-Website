/* Edit this file to update your storefront. Use only a Tebex PUBLIC token. */
window.MS_CONFIG = {
  brand: 'MikeScripts',
  storeUrl: 'https://mikescripts.tebex.io',
  discordUrl: 'https://discord.gg/bBbZk5HzPK',
  publicToken: '',
  // Real gameplay media only. Local paths or HTTPS URLs; no stock substitutes.
  heroVideo: 'https://www.youtube.com/watch?v=pgvk9rsA2ms',
  products: [
    {
      slug: 'flight', category: 'aviation', code: 'MS FLIGHT', name: 'All-In-One Flight Simulator',
      headline: 'The sky is only the beginning.',
      description: 'Build an aviation career, not just a flight job. Cockpit systems, pilot training, aircraft ownership and air traffic control connect in one resource.',
      tags: ['ESX', 'QBCore', 'Qbox'],
      features: ['Cockpit avionics, autopilot and autoland', 'Pilot training and certification', 'Aircraft ownership and company management', 'Air traffic control, radar and flight plans'],
      requirements: 'See the Tebex listing for the current dependency list and installation instructions.',
      variants: [{id: '7324328', label: 'One-time', type: 'single'}, {id: '7472845', label: 'Monthly', type: 'subscription'}],
      cover: '',
      media: [{type: 'youtube', url: 'https://www.youtube.com/watch?v=pgvk9rsA2ms', label: 'Flight showcase'}, {type: 'youtube', url: 'https://youtu.be/EXTJy9Ej5Gk', label: 'Aviation overview'}, {type: 'youtube', url: 'https://youtu.be/qTklr-XB41c', label: 'Gameplay showcase'}]
    },
    {
      slug: 'police', category: 'police', code: 'MS HELIPOL', name: 'Police Helicopter System',
      headline: 'Eyes above. Control below.',
      description: 'Give your air support team the tools to follow the action. A connected helicopter camera, spotlight, plate recognition and rappel workflow for police roleplay.',
      tags: ['ESX', 'QBCore', 'Qbox'],
      features: ['Helicopter camera and targeting', 'Spotlight and target lock', 'Automatic license plate recognition', 'Rappelling for tactical deployment'],
      requirements: 'Check supported helicopters and dependencies on the current Tebex listing.',
      variants: [{id: '7426329', label: 'One-time', type: 'single'}], cover: '', media: []
    },
    {
      slug: 'fire', category: 'fire', code: 'MS FIRE', name: 'Advanced Fire System',
      headline: 'Every alarm starts a story.',
      description: 'Turn buildings into connected emergency-response environments. Fire panels, pull stations, strobes, sprinklers and inspections give firefighters a complete workflow.',
      tags: ['ESX', 'QBCore', 'Qbox'],
      features: ['Interactive fire alarm control panels', 'Pull stations, synced strobes and sprinklers', 'Firefighter inspections and device maintenance', 'In-game setup for buildings and alarm zones'],
      requirements: 'See the Tebex listing for the required database, target and framework resources.',
      variants: [{id: '7437723', label: 'One-time', type: 'single'}], cover: '', media: []
    }
  ],
  aircraft: [
    {
      slug: 'ms100', category: 'aircraft', code: 'MS100 MAX', name: 'MS100 MAX',
      headline: 'Your next departure.',
      description: 'A custom passenger aircraft built for FiveM, with a walkable interior that brings the journey inside the cabin.',
      tags: ['Custom aircraft', 'Walkable interior'], features: ['Custom MikeScripts aircraft', 'Walkable passenger interior'],
      requirements: 'Ask MikeScripts about availability, installation and compatibility with the aviation framework.',
      cover: '', media: [], variants: []
    },
    {
      slug: 'ms8000', category: 'aircraft', code: 'MS8000', name: 'MS8000',
      headline: 'A different class of flight.',
      description: 'A custom luxury jet for FiveM. A walkable interior makes the cabin part of the experience, not just something you see through a window.',
      tags: ['Custom aircraft', 'Luxury interior'], features: ['Custom luxury jet', 'Walkable cabin interior'],
      requirements: 'Ask MikeScripts about availability, installation and compatibility with the aviation framework.',
      cover: '', media: [], variants: []
    }
  ]
};
