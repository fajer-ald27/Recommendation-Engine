// All the information the site shows, kept in one place so it is easy to edit.
// Hotel names are well-known examples; always check prices and availability.
//
// Each place has:
//   vibe    - what kind of trip it suits (see VIBES below)
//   outdoor - true if you spend most of the visit outside (matters when it's hot)
//   months  - the best months to go (1 = January ... 12 = December)

const VIBES = {
  culture: "Culture & history",
  food: "Markets & food",
  beach: "Beaches & sea",
  nature: "Desert & nature",
  city: "City & shopping"
};

const COUNTRIES = [
  {
    id: "KW",
    typicalHighs: [19, 22, 27, 33, 41, 45, 46, 46, 43, 37, 27, 21],   // usual daytime high, January to December (°C)
    name: "Kuwait",
    capital: "Kuwait City",
    lat: 29.3759,
    lon: 47.9774,
    airport: "KWI",
    places: [
      { name: "Kuwait Towers", city: "Kuwait City", text: "The country's famous landmark, with views over the Gulf. Best visited in the evening.", vibe: "culture", outdoor: true, months: [10, 11, 12, 1, 2, 3, 4] },
      { name: "Souq Al-Mubarakiya", city: "Kuwait City", text: "A traditional market full of spices, dates, local food, and souvenirs.", vibe: "food", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Failaka Island", city: "Failaka", text: "A short ferry ride away, with quiet beaches and ancient Greek ruins.", vibe: "beach", outdoor: true, months: [3, 4, 5, 10, 11] }
    ],
    hotels: [
      { name: "Four Seasons Hotel Kuwait at Burj Alshaya", city: "Kuwait City", type: "Luxury city" },
      { name: "Jumeirah Messilah Beach Hotel", city: "Messilah", type: "Beach resort" }
    ]
  },
  {
    id: "SA",
    typicalHighs: [20, 23, 28, 33, 40, 43, 44, 44, 41, 35, 27, 22],   // usual daytime high, January to December (°C)
    name: "Saudi Arabia",
    capital: "Riyadh",
    lat: 24.7136,
    lon: 46.6753,
    airport: "RUH",
    places: [
      { name: "Diriyah (At-Turaif)", city: "Riyadh", text: "A UNESCO-listed mud-brick old town with restaurants and evening walks.", vibe: "culture", outdoor: true, months: [10, 11, 12, 1, 2, 3, 4] },
      { name: "Al-Balad", city: "Jeddah", text: "Jeddah's historic district of coral-stone houses and busy souqs.", vibe: "food", outdoor: true, months: [10, 11, 12, 1, 2, 3, 4] },
      { name: "AlUla & Hegra", city: "AlUla", text: "Desert canyons and Nabataean tombs carved into sandstone.", vibe: "nature", outdoor: true, months: [10, 11, 12, 1, 2, 3] }
    ],
    hotels: [
      { name: "Four Seasons Hotel Riyadh at Kingdom Centre", city: "Riyadh", type: "Luxury city" },
      { name: "Rosewood Jeddah", city: "Jeddah", type: "Seafront" }
    ]
  },
  {
    id: "BH",
    typicalHighs: [20, 21, 25, 29, 34, 36, 38, 38, 36, 33, 28, 22],   // usual daytime high, January to December (°C)
    name: "Bahrain",
    capital: "Manama",
    lat: 26.2285,
    lon: 50.5860,
    airport: "BAH",
    places: [
      { name: "Bahrain Fort (Qal'at al-Bahrain)", city: "Manama", text: "A UNESCO site by the sea, beautiful at sunset.", vibe: "culture", outdoor: true, months: [10, 11, 12, 1, 2, 3, 4] },
      { name: "Bab Al Bahrain & Manama Souq", city: "Manama", text: "The historic gateway and the lanes of shops behind it.", vibe: "food", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Bahrain National Museum", city: "Manama", text: "A good introduction to the island's 5,000-year history.", vibe: "culture", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
    ],
    hotels: [
      { name: "Four Seasons Hotel Bahrain Bay", city: "Manama", type: "Luxury city" },
      { name: "The Ritz-Carlton, Bahrain", city: "Manama", type: "Beach resort" }
    ]
  },
  {
    id: "QA",
    typicalHighs: [22, 23, 27, 32, 38, 41, 42, 41, 39, 35, 29, 24],   // usual daytime high, January to December (°C)
    name: "Qatar",
    capital: "Doha",
    lat: 25.2854,
    lon: 51.5310,
    airport: "DOH",
    places: [
      { name: "Museum of Islamic Art", city: "Doha", text: "A striking museum on the Corniche with a large waterfront park.", vibe: "culture", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Souq Waqif", city: "Doha", text: "A lively market with restaurants, falcons, and shisha cafes.", vibe: "food", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Inland Sea (Khor Al Adaid)", city: "Southern Qatar", text: "Where sand dunes meet the sea. Go with a 4x4 tour.", vibe: "nature", outdoor: true, months: [11, 12, 1, 2, 3] }
    ],
    hotels: [
      { name: "Mandarin Oriental, Doha", city: "Doha", type: "Luxury city" },
      { name: "The Ritz-Carlton, Doha", city: "Doha", type: "Seafront" }
    ]
  },
  {
    id: "AE",
    typicalHighs: [24, 25, 28, 32, 37, 39, 41, 41, 39, 35, 30, 26],   // usual daytime high, January to December (°C)
    name: "UAE",
    capital: "Abu Dhabi",
    lat: 24.4539,
    lon: 54.3773,
    airport: "AUH",
    places: [
      { name: "Sheikh Zayed Grand Mosque", city: "Abu Dhabi", text: "One of the world's largest mosques, especially beautiful at night.", vibe: "culture", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Burj Khalifa & Dubai Mall", city: "Dubai", text: "The tallest building in the world, with the fountain show below.", vibe: "city", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Jebel Jais", city: "Ras Al Khaimah", text: "The UAE's highest mountain, with cooler air and the world's longest zipline.", vibe: "nature", outdoor: true, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
    ],
    hotels: [
      { name: "Emirates Palace Mandarin Oriental", city: "Abu Dhabi", type: "Luxury palace" },
      { name: "Atlantis The Palm", city: "Dubai", type: "Family resort" }
    ]
  },
  {
    id: "OM",
    typicalHighs: [25, 26, 29, 34, 38, 40, 38, 36, 35, 34, 30, 27],   // usual daytime high, January to December (°C)
    name: "Oman",
    capital: "Muscat",
    lat: 23.5880,
    lon: 58.3829,
    airport: "MCT",
    places: [
      { name: "Sultan Qaboos Grand Mosque", city: "Muscat", text: "A stunning mosque with a huge hand-woven carpet.", vibe: "culture", outdoor: false, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { name: "Nizwa Fort & Souq", city: "Nizwa", text: "A historic fort and a famous Friday goat market.", vibe: "food", outdoor: true, months: [10, 11, 12, 1, 2, 3, 4] },
      { name: "Wahiba Sands", city: "Sharqiya", text: "Golden dunes and overnight desert camps.", vibe: "nature", outdoor: true, months: [10, 11, 12, 1, 2, 3] }
    ],
    hotels: [
      { name: "Al Bustan Palace, a Ritz-Carlton Hotel", city: "Muscat", type: "Beach resort" },
      { name: "Shangri-La Barr Al Jissah", city: "Muscat", type: "Family resort" }
    ]
  }
];

// Approximate travel between capitals.
// km = road distance, borders = border crossings by car, flight = direct flight in minutes.
const ROUTES = {
  "KW-SA": { km: 670,  borders: 1, flight: 100 },
  "KW-BH": { km: 450,  borders: 2, flight: 65 },
  "KW-QA": { km: 800,  borders: 2, flight: 85 },
  "KW-AE": { km: 1290, borders: 2, flight: 115 },
  "KW-OM": { km: 1750, borders: 3, flight: 135 },
  "SA-BH": { km: 440,  borders: 1, flight: 75 },
  "SA-QA": { km: 580,  borders: 1, flight: 85 },
  "SA-AE": { km: 950,  borders: 1, flight: 115 },
  "SA-OM": { km: 1400, borders: 2, flight: 140 },
  "BH-QA": { km: 430,  borders: 2, flight: 50 },
  "BH-AE": { km: 920,  borders: 2, flight: 80 },
  "BH-OM": { km: 1370, borders: 3, flight: 110 },
  "QA-AE": { km: 590,  borders: 2, flight: 70 },
  "QA-OM": { km: 1040, borders: 3, flight: 100 },
  "AE-OM": { km: 450,  borders: 1, flight: 65 }
};
