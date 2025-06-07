// scripts/generate-json.mjs
import { faker } from '@faker-js/faker/locale/it';
import { ObjectId } from 'bson';
import { writeFile } from 'fs/promises';

const ORG_COUNT = 100;
const EVT_COUNT = 500;
const CATEGORIES = ["Sport", "Teatro", "Notturni", "Lounge Bar"];
const IT_CITIES = [
  { comune: "Roma", provincia: "RM", regione: "Lazio" },
  { comune: "Milano", provincia: "MI", regione: "Lombardia" },
  { comune: "Napoli", provincia: "NA", regione: "Campania" },
  { comune: "Torino", provincia: "TO", regione: "Piemonte" },
  { comune: "Firenze", provincia: "FI", regione: "Toscana" },
  { comune: "Bologna", provincia: "BO", regione: "Emilia-Romagna" },
  { comune: "Venezia", provincia: "VE", regione: "Veneto" },
  { comune: "Palermo", provincia: "PA", regione: "Sicilia" },
  { comune: "Genova", provincia: "GE", regione: "Liguria" },
  { comune: "Bari", provincia: "BA", regione: "Puglia" },
];

// 1. Organizzazioni
const organizations = Array.from({ length: ORG_COUNT }).map(() => {
  const city = faker.helpers.arrayElement(IT_CITIES);
  return {
    _id: { $oid: new ObjectId().toHexString() },
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    indirizzo: faker.location.streetAddress(),
    comune: city.comune,
    provincia: city.provincia,
    regione: city.regione,
    phone: faker.phone.number("3#########"),
    email: faker.internet.email().toLowerCase(),
    linkEsterno: faker.internet.url(),
    imageSrc: null,
    seoUrl: faker.lorem.slug(),
    latitudine: faker.location.latitude(),
    longitudine: faker.location.longitude(),
    organizerIds: [],
    createdAt: { $date: faker.date.past().toISOString() },
    stripeAccountId: null,
    ticketingStatus: "no_stripe",
  };
});

// 2. Eventi
const events = Array.from({ length: EVT_COUNT }).map(() => {
  const org = faker.helpers.arrayElement(organizations);
  const city = { comune: org.comune, provincia: org.provincia, regione: org.regione };
  return {
    _id: { $oid: new ObjectId().toHexString() },
    title: `${faker.lorem.words(3)} – Powered by ${org.name}`,
    description: faker.lorem.paragraph(),
    imageSrc: null,
    createdAt: { $date: faker.date.recent().toISOString() },
    category: faker.helpers.arrayElement(CATEGORIES),
    comune: city.comune,
    provincia: city.provincia,
    regione: city.regione,
    latitudine: org.latitudine,
    longitudine: org.longitudine,
    favoriteCount: faker.number.int({ min: 0, max: 150 }),
    eventDate: { $date: faker.date.future().toISOString() },
    indirizzo: `${faker.location.streetAddress()}, ${city.comune} (${city.provincia})`,
    organizationId: { $oid: org._id.$oid },
    status: "ACTIVE",
    isReservationActive: true,
  };
});

// 3. Scrivi su file
await writeFile("organizations.json", JSON.stringify(organizations, null, 2));
await writeFile("events.json", JSON.stringify(events, null, 2));

console.log("✅ File JSON generati: organizations.json & events.json");
