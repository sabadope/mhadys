// Service + scene configuration for the MhadysEvents 3D hero.
export type ServiceId = "events" | "merch" | "auto";

export interface ServiceDef {
  id: ServiceId;
  name: string;
  hint: string;
  module: "event" | "commerce" | "autocare";
  /** World-space focus point of the environment */
  focus: [number, number, number];
}

export const SERVICES: ServiceDef[] = [
  { id: "events", name: "Events", hint: "Plan & book", module: "event", focus: [-24, 3, 0] },
  { id: "merch", name: "Merchandise", hint: "Browse & shop", module: "commerce", focus: [0, 2, 0] },
  { id: "auto", name: "Auto Care", hint: "Choose & schedule", module: "autocare", focus: [24, 2, 0] },
];

export interface HotspotDef {
  id: string;
  service: ServiceId;
  title: string;
  description: string;
  cta: string;
  to: "/book" | "/store" | "/login";
  position: [number, number, number];
}

export const HOTSPOTS: HotspotDef[] = [
  { id: "wedding", service: "events", title: "Wedding & Celebrations", description: "Grand ballroom in the mansion's Events wing — staging, florals, and full-service catering for up to 300 guests.", cta: "Explore Packages", to: "/book", position: [-27, 3.2, 2] },
  { id: "corporate", service: "events", title: "Corporate Events", description: "Seminar hall with AV, staging, and flexible seating for conferences and product launches.", cta: "Explore Packages", to: "/book", position: [-21, 6.4, 2] },
  { id: "rooftop", service: "events", title: "Rooftop Terrace", description: "Open-air garden terrace with string lights and a reflecting pool for sunset receptions.", cta: "View Venue", to: "/book", position: [-24, 10.2, 0] },
  { id: "collections", service: "merch", title: "Product Collections", description: "The glazed Commerce atrium — apparel, accessories, and event merchandise, stocked and ready to ship.", cta: "Browse Products", to: "/store", position: [-4, 5, -2] },
  { id: "bundles", service: "merch", title: "Bundles & Promotions", description: "Curated merchandise bundles and seasonal promos at transparent prices.", cta: "See Bundles", to: "/store", position: [3, 3, 2] },
  { id: "fulfillment", service: "merch", title: "Order Fulfillment", description: "Packed, sorted, and dispatched same-day from the mansion's fulfillment wing.", cta: "Track an Order", to: "/store", position: [6, 3, 5] },
  { id: "wash", service: "auto", title: "Car Wash", description: "Automatic tunnel wash in the Automotive pavilion — soft-touch brushes and spot-free rinse in under 15 minutes.", cta: "Book Appointment", to: "/login", position: [19, 4.2, -1] },
  { id: "detailing", service: "auto", title: "Detailing & Polishing", description: "Paint correction, polishing, and ceramic coating in dedicated detailing bays.", cta: "Book Appointment", to: "/login", position: [26, 3.6, -2] },
  { id: "services", service: "auto", title: "Automotive Services", description: "Interior cleaning and vehicle preparation, with a glass-front showroom and customer lounge.", cta: "Book Appointment", to: "/login", position: [29, 3.4, 4] },
];

export const SLIDE_MS = 4000;
export const MANUAL_PAUSE_MS = 8000;

/** Pure autoplay rule: next service in the cycle. */
export function nextService(id: ServiceId): ServiceId {
  const i = SERVICES.findIndex((s) => s.id === id);
  return SERVICES[(i + 1) % SERVICES.length]!.id;
}
