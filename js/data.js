// ============================================================
// data.js — seed data model + localStorage persistence
// Represents one district with several PHC/CHC centres.
// In a real deployment this layer would be swapped for API calls;
// every other module only talks to getDistrict()/saveDistrict().
// ============================================================

const STORAGE_KEY = "sh_district_v1";

// deterministic pseudo-random so the demo looks the same on every load
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildFootfall(rand, base, days = 14) {
  const arr = [];
  let v = base;
  for (let i = 0; i < days; i++) {
    v = Math.max(5, Math.round(v + (rand() - 0.45) * 8));
    arr.push(v);
  }
  return arr;
}

function buildAttendanceWeek(rand, reliability) {
  return Array.from({ length: 7 }, () => rand() < reliability);
}

const MEDICINES = [
  { name: "Paracetamol 500mg", unit: "strips" },
  { name: "ORS Sachets", unit: "packets" },
  { name: "Amoxicillin 250mg", unit: "strips" },
  { name: "Iron & Folic Acid", unit: "strips" },
  { name: "IV Fluid (NS 500ml)", unit: "bottles" },
  { name: "Anti-Rabies Vaccine", unit: "vials" },
];

const TESTS = [
  "Blood Glucose (RBS)",
  "Malaria Rapid Test",
  "Hemoglobin",
  "Urine Pregnancy Test",
  "COVID-19 RAT",
  "Sputum (TB) Test",
];

const CENTRE_SEED = [
  { name: "Manvi PHC", type: "PHC", block: "Manvi", seed: 11, bedTotal: 12, footfallBase: 40, reliability: 0.9 },
  { name: "Sindhanur CHC", type: "CHC", block: "Sindhanur", seed: 23, bedTotal: 30, footfallBase: 85, reliability: 0.8 },
  { name: "Devadurga PHC", type: "PHC", block: "Devadurga", seed: 37, bedTotal: 10, footfallBase: 28, reliability: 0.55 },
  { name: "Lingsugur CHC", type: "CHC", block: "Lingsugur", seed: 41, bedTotal: 25, footfallBase: 70, reliability: 0.7 },
  { name: "Raichur Urban PHC", type: "PHC", block: "Raichur Urban", seed: 53, bedTotal: 14, footfallBase: 95, reliability: 0.95 },
  { name: "Sirwar PHC", type: "PHC", block: "Sirwar", seed: 61, bedTotal: 8, footfallBase: 22, reliability: 0.6 },
];

function seedDistrict() {
  const centres = CENTRE_SEED.map((c, idx) => {
    const rand = seededRandom(c.seed);
    const medicines = MEDICINES.map((m) => {
      const dailyConsumptionAvg = +(2 + rand() * 6).toFixed(1);
      // deliberately make some centres critical for a compelling demo
      const stressFactor = c.reliability < 0.65 ? 0.5 : 1.4;
      const stock = Math.round(dailyConsumptionAvg * (4 + rand() * 20) * stressFactor);
      const threshold = Math.round(dailyConsumptionAvg * 7);
      return { name: m.name, unit: m.unit, stock, threshold, dailyConsumptionAvg };
    });
    const doctorCount = c.type === "CHC" ? 4 : 2;
    const doctors = Array.from({ length: doctorCount }, (_, i) => {
      const attendanceWeek = buildAttendanceWeek(rand, c.reliability);
      return {
        name: `Dr. ${["Rao", "Iyer", "Khan", "Patil", "Naik", "Reddy"][(idx * 2 + i) % 6]} ${i + 1}`,
        scheduled: true,
        attendanceWeek,
        todayPresent: attendanceWeek[6],
      };
    });
    const tests = TESTS.map((name, i) => ({
      name,
      available: rand() > (c.reliability < 0.65 ? 0.45 : 0.12),
    }));
    const occPct = c.reliability < 0.65 ? 0.55 + rand() * 0.4 : 0.4 + rand() * 0.45;
    return {
      id: `c${idx + 1}`,
      name: c.name,
      type: c.type,
      block: c.block,
      bedTotal: c.bedTotal,
      bedOccupied: Math.min(c.bedTotal, Math.round(c.bedTotal * occPct)),
      footfall: buildFootfall(rand, c.footfallBase),
      medicines,
      doctors,
      tests,
    };
  });
  return { district: "Raichur District", centres, lastUpdated: new Date().toISOString() };
}

function getDistrict() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      /* fall through to reseed */
    }
  }
  const fresh = seedDistrict();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDistrict(d) {
  d.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function resetDistrict() {
  localStorage.removeItem(STORAGE_KEY);
  return getDistrict();
}

function getCentre(d, id) {
  return d.centres.find((c) => c.id === id);
}
