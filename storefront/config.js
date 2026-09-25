/* Public data only. No secret keys. Edit media in media-overrides.js or use media-studio.html. */
window.MS_CONFIG = {
  "brand": "MikeScripts",
  "storeUrl": "https://mikescripts.tebex.io",
  "discordUrl": "https://discord.gg/bBbZk5HzPK",
  "publicToken": "",
  "products": [
    {
      "slug": "flight",
      "category": "aviation",
      "code": "MS FLIGHT",
      "name": "Flight Simulator",
      "summary": "Pilot training, cockpit systems and air traffic control.",
      "description": "Give pilots a career with certification, aircraft ownership, flight planning and a cockpit they can operate. Air traffic controllers and company managers have their own tools.",
      "tags": [
        "ESX",
        "QBCore",
        "Qbox"
      ],
      "features": [
        "Cockpit avionics, autopilot and autoland",
        "Pilot training and certification",
        "Aircraft ownership and company management",
        "Air traffic control, radar and flight plans"
      ],
      "requirements": "The listing specifies oxmysql, ox_lib, ox_inventory and ESX, QBCore or Qbox. Check the current Tebex listing before purchase.",
      "variants": [
        {
          "id": "7324328",
          "label": "One-time purchase",
          "type": "single"
        },
        {
          "id": "7472845",
          "label": "Monthly subscription",
          "type": "subscription",
          "needsConfirmation": true
        }
      ],
      "cover": "https://dunb17ur4ymx4.cloudfront.net/packages/images/740bc080dc970ad3293076e6a704241ce3e9e4ff.png",
      "media": [
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/19923446f797aa54647be5fcfb33041961af262a.gif",
          "label": "Flight Simulator · gameplay 01"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/25924e9723b88e882b49880ff64601f7be66e5bb.gif",
          "label": "Flight Simulator · gameplay 02"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/d4a6a85a345036212e7cd82e5ef2211628fec3f7.gif",
          "label": "Flight Simulator · gameplay 03"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/e7f0ade37548b864e1e92598f103ad17b55a1633.gif",
          "label": "Flight Simulator · gameplay 04"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/c317f03ac7cfaa6d85cbf49c83f075b2db961550.gif",
          "label": "Flight Simulator · gameplay 05"
        },
        {
          "type": "youtube",
          "url": "https://youtu.be/EXTJy9Ej5Gk",
          "label": "Aviation video showcase",
          "poster": "https://img.youtube.com/vi/EXTJy9Ej5Gk/hqdefault.jpg"
        }
      ],
      "includes": [
        "Flight and pilot-career resource",
        "Cockpit displays, flight plans and ATC tools",
        "Editable configuration, bridge and language files"
      ],
      "notIncluded": [
        "MS100 MAX and MS8000 are separate aircraft projects. Check the chosen package before assuming they are bundled."
      ],
      "source": "https://mikescripts.tebex.io/package/7324328",
      "sourceChecked": "2026-09-25"
    },
    {
      "slug": "police",
      "category": "police",
      "code": "MS HELIPOL",
      "name": "Police Helicopter System",
      "summary": "Camera, spotlight, target tracking and rappel for air support.",
      "description": "Operate a stabilized helicopter camera, follow a target, identify vehicle plates and coordinate a spotlight. Configurable helicopter and job permissions keep the controls with the right crew.",
      "tags": [
        "ESX",
        "QBCore",
        "Qbox",
        "Standalone"
      ],
      "features": [
        "Stabilized camera with zoom and vision modes",
        "Replicated spotlight and target tracking",
        "Vehicle plate identification",
        "Rappelling with server-side permission checks"
      ],
      "requirements": "Supports ESX, QBCore, Qbox and standalone ACE permissions. Confirm your helicopter models and current requirements on the Tebex listing.",
      "variants": [
        {
          "id": "7426329",
          "label": "One-time purchase",
          "type": "single"
        }
      ],
      "cover": "https://dunb17ur4ymx4.cloudfront.net/packages/images/6d18710e3df45d8c3b3f053b0cab96e93691419f.png",
      "media": [
        {
          "type": "image",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/40277f160d6f1e7039d2018b74740910c3953339.jpg",
          "label": "Helipol · in-game view 01"
        },
        {
          "type": "image",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/affab74181c1bd4f7b6f4363a37c98123d4ace20.jpg",
          "label": "Helipol · in-game view 02"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/98838f950c4cf60125c651b82266227f6579854a.gif",
          "label": "Helipol · gameplay 01"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/688398d9c48d5b6a53b9c305806dd0e2daf46c17.gif",
          "label": "Helipol · gameplay 02"
        }
      ],
      "includes": [
        "Helicopter camera, spotlight and target tools",
        "Rappel and permission configuration",
        "Editable configuration and installation notes"
      ],
      "notIncluded": [
        "This is a script. Do not assume custom helicopter models shown in media are included."
      ],
      "source": "https://mikescripts.tebex.io/package/7426329",
      "sourceChecked": "2026-09-25"
    },
    {
      "slug": "fire",
      "category": "fire",
      "code": "MS FIRE",
      "name": "Fire & Alarm System",
      "summary": "Working panels, alarm devices, sprinklers and firefighter inspections.",
      "description": "Set up a building, connect its devices and give firefighters a response and inspection workflow. Alarm panels, pull stations and sprinklers are part of the resource, not just scenery.",
      "tags": [
        "ESX",
        "QBCore",
        "Qbox"
      ],
      "features": [
        "Interactive alarm panels and manual pull stations",
        "Synchronized strobes and working sprinklers",
        "Firefighter inspections and device maintenance",
        "In-game building and zone setup"
      ],
      "requirements": "The listing specifies oxmysql, ox_target and ESX, QBCore or Qbox. ox_inventory is recommended. Product artwork does not imply that the illustrated fire truck is included.",
      "variants": [
        {
          "id": "7437723",
          "label": "One-time purchase",
          "type": "single"
        }
      ],
      "cover": "https://dunb17ur4ymx4.cloudfront.net/packages/images/4e9440f3fb6e8f5c1f9625d7059f7d7eb36a78cd.png",
      "media": [
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/33a08d748f7492a8a89547c4d49322dfee881edb.gif",
          "label": "Fire system · gameplay 01"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/78c52578e1d661e464fcc84e747ae6ecdf1fbd58.gif",
          "label": "Fire system · gameplay 02"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/10e2ff4001f2b5ab3f1e72923dc6274fd15c05f9.gif",
          "label": "Fire system · gameplay 03"
        },
        {
          "type": "clip",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/dda74e9bf86798330c0a0a35808ce12a777698f5.gif",
          "label": "Fire system · gameplay 04"
        }
      ],
      "includes": [
        "Fire and alarm resource with bundled device props",
        "Building setup and inspection tools",
        "Editable configuration, bridge, languages and NUI"
      ],
      "notIncluded": [
        "A fire truck is not advertised as included. The product is the alarm and firefighter system."
      ],
      "source": "https://mikescripts.tebex.io/package/7437723",
      "sourceChecked": "2026-09-25"
    },
    {
      "slug": "wrecker",
      "category": "vehicles",
      "code": "MS HWYWRK",
      "name": "Heavy Rotator Wrecker",
      "summary": "A rotator truck with working winches, outriggers and operator controls.",
      "description": "Position the truck, plant its outriggers, carry a hook to the vehicle and work the recovery from the rear controls. The package includes the truck and its operating scripts.",
      "tags": [
        "Standalone",
        "OneSync",
        "ESX / QB / Qbox jobs"
      ],
      "features": [
        "360° boom rotation with two-stage extension",
        "Three winches with carryable hooks",
        "Functional outriggers and wheel-lift",
        "Two rear control panels and synchronized equipment"
      ],
      "requirements": "Requires a FiveM server with OneSync. No framework is required; ESX, QBCore and Qbox support is used for optional job permissions. Includes the vehicle and its scripts.",
      "variants": [
        {
          "id": "7692812",
          "label": "One-time purchase",
          "type": "single"
        }
      ],
      "cover": "https://dunb17ur4ymx4.cloudfront.net/packages/images/c9c7444cd25f58aa414cc2c130a5181cebce7445.png",
      "media": [
        {
          "type": "image",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/e2c11bf6c35e9829b4d21756b02a7535e38b0592.png",
          "label": "Wrecker · product view"
        },
        {
          "type": "image",
          "url": "https://dunb17ur4ymx4.cloudfront.net/packages/images/c9c7444cd25f58aa414cc2c130a5181cebce7445.png",
          "label": "Wrecker · official artwork"
        }
      ],
      "includes": [
        "Custom recovery vehicle and operating scripts",
        "Moving equipment, textures and sounds",
        "Configuration, language file and installation README"
      ],
      "notIncluded": [
        "Additional vehicles or scenery appearing in the showcase are not listed as part of the package."
      ],
      "source": "https://mikescripts.tebex.io/package/7692812",
      "sourceChecked": "2026-09-25"
    }
  ],
  "aircraft": [
    {
      "slug": "ms100",
      "category": "aircraft",
      "code": "MS100 MAX",
      "name": "MS100 MAX",
      "summary": "Passenger aircraft with a walkable cabin.",
      "description": "A custom MikeScripts passenger aircraft for FiveM with a walkable interior.",
      "tags": [
        "Custom aircraft",
        "Walkable interior"
      ],
      "features": [
        "Custom MikeScripts aircraft",
        "Walkable passenger interior"
      ],
      "requirements": "Contact MikeScripts for availability, pricing, installation and compatibility. This aircraft is not advertised as included with the Flight Simulator.",
      "cover": "",
      "media": [],
      "variants": [],
      "includes": [],
      "notIncluded": [
        "Package contents and sale availability have not been connected to this showcase. Contact MikeScripts before purchasing."
      ],
      "source": ""
    },
    {
      "slug": "ms8000",
      "category": "aircraft",
      "code": "MS8000",
      "name": "MS8000",
      "summary": "Custom luxury jet with a walkable cabin.",
      "description": "A custom luxury jet for FiveM, with a walkable cabin interior.",
      "tags": [
        "Custom aircraft",
        "Luxury cabin"
      ],
      "features": [
        "Custom luxury jet",
        "Walkable cabin interior"
      ],
      "requirements": "Contact MikeScripts for availability, pricing, installation and compatibility. This aircraft is not advertised as included with the Flight Simulator.",
      "cover": "",
      "media": [],
      "variants": [],
      "includes": [],
      "notIncluded": [
        "Package contents and sale availability have not been connected to this showcase. Contact MikeScripts before purchasing."
      ],
      "source": ""
    }
  ],
  "heroProduct": "flight"
};
