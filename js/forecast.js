// ============================================================
// forecast.js — the "AI" layer.
// Lightweight, explainable heuristics stand in for a trained model:
// trend-adjusted consumption forecasting, cross-centre redistribution
// matching, and a composite under-performance score.
// Every function is pure (data in, numbers out) so it's easy to swap
// for a real ML/forecasting service later without touching the UI.
// ============================================================

// simple linear trend of the last N footfall points, used to scale
// medicine demand forecasts up/down with real patient load
function footfallGrowth(footfall) {
  const n = footfall.length;
  const half = Math.floor(n / 2);
  const firstAvg = footfall.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const secondAvg = footfall.slice(half).reduce((a, b) => a + b, 0) / (n - half);
  if (firstAvg === 0) return 1;
  return Math.max(0.5, Math.min(1.8, secondAvg / firstAvg));
}

function daysLeft(medicine) {
  if (medicine.dailyConsumptionAvg <= 0) return Infinity;
  return medicine.stock / medicine.dailyConsumptionAvg;
}

function stockStatus(medicine) {
  const dl = daysLeft(medicine);
  if (medicine.stock <= 0) return "out";
  if (dl <= 3 || medicine.stock < medicine.threshold * 0.3) return "out";
  if (dl <= 10 || medicine.stock < medicine.threshold) return "low";
  return "ok";
}

function forecastMedicine(centre, medicine) {
  const growth = footfallGrowth(centre.footfall);
  const projectedDailyUse = medicine.dailyConsumptionAvg * growth;
  const projected7Day = Math.round(projectedDailyUse * 7);
  const dl = medicine.dailyConsumptionAvg > 0 ? medicine.stock / projectedDailyUse : Infinity;
  return {
    projected7Day,
    daysLeft: dl,
    willRunOutWithinWeek: dl <= 7,
  };
}

function centreBedOccPct(centre) {
  return centre.bedTotal ? centre.bedOccupied / centre.bedTotal : 0;
}

function centreAttendancePct(centre) {
  if (!centre.doctors.length) return 1;
  const total = centre.doctors.reduce((sum, d) => sum + d.attendanceWeek.filter(Boolean).length, 0);
  return total / (centre.doctors.length * 7);
}

function centreTestAvailPct(centre) {
  if (!centre.tests.length) return 1;
  return centre.tests.filter((t) => t.available).length / centre.tests.length;
}

function centreStockoutCount(centre) {
  return centre.medicines.filter((m) => stockStatus(m) === "out").length;
}

// composite 0-100 "health-ops score" — higher is healthier
function centreScore(centre) {
  const stockoutPenalty = Math.min(40, centreStockoutCount(centre) * 12);
  const occ = centreBedOccPct(centre);
  const bedPenalty = occ > 0.9 ? (occ - 0.9) * 200 : occ < 0.15 ? 10 : 0;
  const attendance = centreAttendancePct(centre);
  const attendancePenalty = attendance < 0.75 ? (0.75 - attendance) * 100 : 0;
  const testAvail = centreTestAvailPct(centre);
  const testPenalty = testAvail < 0.8 ? (0.8 - testAvail) * 60 : 0;
  const score = Math.max(0, Math.round(100 - stockoutPenalty - bedPenalty - attendancePenalty - testPenalty));
  return score;
}

function centreFlags(centre) {
  const flags = [];
  if (centreStockoutCount(centre) > 0) flags.push("reasonStock");
  if (centreBedOccPct(centre) > 0.9) flags.push("reasonBeds");
  if (centreAttendancePct(centre) < 0.75) flags.push("reasonDoctor");
  if (centreTestAvailPct(centre) < 0.8) flags.push("reasonTest");
  return flags;
}

// match centres with surplus of a medicine to centres about to run out
function redistributionSuggestions(district) {
  const suggestions = [];
  MEDICINE_NAMES(district).forEach((medName) => {
    const rows = district.centres
      .map((c) => {
        const med = c.medicines.find((m) => m.name === medName);
        if (!med) return null;
        return { centre: c, med, dl: daysLeft(med) };
      })
      .filter(Boolean);

    const needy = rows.filter((r) => r.dl <= 7).sort((a, b) => a.dl - b.dl);
    const surplus = rows.filter((r) => r.dl >= 30).sort((a, b) => b.dl - a.dl);

    needy.forEach((need) => {
      const donor = surplus.find((s) => s.centre.id !== need.centre.id && s.med.stock > s.med.threshold);
      if (donor) {
        const targetStock = Math.round(need.med.threshold * 1.2);
        const qty = Math.min(
          Math.max(0, targetStock - need.med.stock),
          Math.max(0, donor.med.stock - donor.med.threshold)
        );
        if (qty > 0) {
          suggestions.push({
            medicine: medName,
            unit: need.med.unit,
            fromId: donor.centre.id,
            fromName: donor.centre.name,
            toId: need.centre.id,
            toName: need.centre.name,
            qty,
          });
          donor.med.stock -= qty; // avoid double-promising the same surplus in this pass
        }
      }
    });
  });
  return suggestions;
}

function MEDICINE_NAMES(district) {
  const set = new Set();
  district.centres.forEach((c) => c.medicines.forEach((m) => set.add(m.name)));
  return Array.from(set);
}
