/* Owner-facing technical facts paraphrased from the official listings, 2026-09-25.
 * These are declared capabilities, not automated server diagnostics.
 * Never put connection credentials, license keys or private tokens here.
 */
window.MS_OWNER_DATA = {
  checked: '2026-09-25',
  demo: {command: 'connect 107.155.80.34:50986', source: 'https://mikescripts.tebex.io/package/7324328'},
  products: {
    flight: {
      frameworks: ['esx', 'qbcore', 'qbox'], kind: 'Script',
      required: ['oxmysql', 'ox_lib', 'ox_inventory'],
      optional: ['ox_target', 'PolyZone', 'Compatible vehicle keys'],
      editable: 'Configuration, framework bridges, translations, HUD configuration and replaceable media.',
      protection: 'Core logic is escrow-protected.',
      setup: 'Add the pilot job and tablet item; follow the bundled database and resource-start instructions.',
      frameworkNote: 'ESX Legacy, QBCore and Qbox are listed. A custom core requires bridge work; standalone is not listed.',
      use: 'Pilot careers & airport roleplay'
    },
    police: {
      frameworks: ['esx', 'qbcore', 'qbox', 'standalone'], kind: 'Script',
      required: [], optional: ['ox_lib', 'OneSync Infinity recommended'],
      editable: 'Configuration and locale file; check the package for other editable files.',
      protection: 'The storefront labels this package escrowed.',
      setup: 'Configure permitted jobs or ACE permissions, helicopter models and seat access.',
      frameworkNote: 'ESX Legacy 1.10+, QBCore, Qbox and standalone with ACE permissions are listed.',
      use: 'Police air support'
    },
    fire: {
      frameworks: ['esx', 'qbcore', 'qbox'], kind: 'Script + device props',
      required: ['oxmysql', 'ox_target'], optional: ['ox_inventory recommended'],
      editable: 'Configuration, English/French locales, SQL, framework bridge and NUI files.',
      protection: 'Core client and server logic is escrow-protected.',
      setup: 'Configure the firefighter job, import the supplied setup and place devices in your buildings.',
      frameworkNote: 'ESX Legacy, QBCore and Qbox are listed. Standalone is not listed.',
      use: 'Fire response & building inspections'
    },
    wrecker: {
      frameworks: ['esx', 'qbcore', 'qbox', 'standalone'], kind: 'Vehicle + operating scripts',
      required: ['OneSync'], optional: ['Framework job permissions'],
      editable: 'Configuration, language file and livery layer with UV guide.',
      protection: 'Asset escrow; configuration and language file remain open.',
      setup: 'Enable OneSync, choose job or ACE permissions and register the truck in your garage or admin tools.',
      frameworkNote: 'No framework is required. ESX, QBCore and Qbox are used only for optional job permissions.',
      use: 'Heavy recovery & roadside roleplay'
    }
  }
};
