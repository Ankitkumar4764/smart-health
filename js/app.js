// ============================================================
// app.js — view rendering + routing (no framework, no build step)
// ============================================================

let district = getDistrict();
let activeView = "overview";
let activeCentreId = district.centres[0].id;
let footfallChart = null;
let forecastChart = null;

const root = document.getElementById("app");

function statusLabel(status) {
  return status === "out" ? t("out") : status === "low" ? t("low") : t("ok");
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(getLang() === "hi" ? "hi-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- shell ----------

function render() {
  document.getElementById("appName").textContent = t("appName");
  document.getElementById("appTag").textContent = t("appTag");
  document.getElementById("langBtn").textContent = t("langToggle");
  document.getElementById("lastUpdatedLabel").textContent = t("lastUpdated");
  document.getElementById("lastUpdatedVal").textContent = fmtDate(district.lastUpdated);
  const footerEl = document.getElementById("footerText");
  if (footerEl) footerEl.textContent = t("footer");

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.view === activeView);
    el.textContent = t(el.dataset.i18n);
  });

  if (activeView === "overview") renderOverview();
  else if (activeView === "centre") renderCentre();
  else if (activeView === "forecast") renderForecast();
  else if (activeView === "redistribute") renderRedistribute();
  else if (activeView === "flagged") renderFlagged();
}

function setView(view) {
  activeView = view;
  render();
}
window.setView = setView;

function toggleLang() {
  setLang(getLang() === "en" ? "hi" : "en");
  render();
}
window.toggleLang = toggleLang;

// ---------- overview ----------

function renderOverview() {
  const centres = district.centres;
  const stockouts = centres.reduce((s, c) => s + centreStockoutCount(c), 0);
  const avgOcc = Math.round((centres.reduce((s, c) => s + centreBedOccPct(c), 0) / centres.length) * 100);
  const avgAtt = Math.round((centres.reduce((s, c) => s + centreAttendancePct(c), 0) / centres.length) * 100);

  root.innerHTML = `
    <section class="stat-row">
      <div class="stat-card"><div class="stat-num">${centres.length}</div><div class="stat-label">${t("centresTracked")}</div></div>
      <div class="stat-card ${stockouts > 0 ? "stat-alert" : ""}"><div class="stat-num">${stockouts}</div><div class="stat-label">${t("stockoutsToday")}</div></div>
      <div class="stat-card"><div class="stat-num">${avgOcc}%</div><div class="stat-label">${t("avgBedOcc")}</div></div>
      <div class="stat-card"><div class="stat-num">${avgAtt}%</div><div class="stat-label">${t("avgAttendance")}</div></div>
    </section>

    <section class="panel">
      <h2>${t("pulseStrip")}</h2>
      <p class="sub">${t("pulseHint")}</p>
      <div class="pulse-strip" id="pulseStrip"></div>
    </section>

    <section class="panel">
      <h2>${t("districtMap")}</h2>
      <table class="reg-table">
        <thead><tr>
          <th>${t("selectCentre")}</th><th>${t("beds")}</th><th>${t("score")}</th>
        </tr></thead>
        <tbody>
          ${centres
            .map((c) => {
              const score = centreScore(c);
              const cls = score >= 75 ? "pill-ok" : score >= 50 ? "pill-low" : "pill-out";
              return `<tr class="row-link" data-open="${c.id}">
                <td><strong>${c.name}</strong><span class="muted"> · ${c.block} · ${t("type" + c.type)}</span></td>
                <td>${c.bedOccupied}/${c.bedTotal}</td>
                <td><span class="pill ${cls}">${score}</span></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>
  `;

  root.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", () => {
      activeCentreId = el.dataset.open;
      setView("centre");
    });
  });

  renderPulseStrip(centres);
}

function renderPulseStrip(centres) {
  const wrap = document.getElementById("pulseStrip");
  wrap.innerHTML = centres
    .map((c) => {
      const score = centreScore(c);
      const state = score >= 75 ? "stable" : score >= 50 ? "warning" : "critical";
      return `<div class="pulse-unit pulse-${state}" data-open="${c.id}" title="${c.name}: ${score}">
        <svg viewBox="0 0 100 24" class="pulse-svg" preserveAspectRatio="none">
          <path d="M0,12 L28,12 L34,2 L42,22 L48,6 L54,12 L100,12" fill="none" stroke-width="2" />
        </svg>
        <div class="pulse-name">${c.name}</div>
        <div class="pulse-tag">${t(state)}</div>
      </div>`;
    })
    .join("");
  wrap.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", () => {
      activeCentreId = el.dataset.open;
      setView("centre");
    });
  });
}

// ---------- centre register ----------

function renderCentre() {
  const centre = getCentre(district, activeCentreId);
  root.innerHTML = `
    <section class="panel">
      <div class="centre-head">
        <select id="centreSelect" class="select">
          ${district.centres.map((c) => `<option value="${c.id}" ${c.id === centre.id ? "selected" : ""}>${c.name}</option>`).join("")}
        </select>
        <span class="badge">${t("type" + centre.type)} · ${centre.block}</span>
      </div>
    </section>

    <section class="panel two-col">
      <div>
        <h2>${t("beds")}</h2>
        <div class="bed-meter">
          <div class="bed-fill" style="width:${Math.min(100, (centre.bedOccupied / centre.bedTotal) * 100)}%"></div>
        </div>
        <p class="sub">${t("occupied")}: <strong>${centre.bedOccupied}</strong> / ${centre.bedTotal} · ${t("available")}: <strong>${centre.bedTotal - centre.bedOccupied}</strong></p>
        <div class="inline-form">
          <label>${t("updateOccupied")}</label>
          <input type="number" id="bedInput" min="0" max="${centre.bedTotal}" value="${centre.bedOccupied}" />
          <button class="btn" id="saveBed">${t("save")}</button>
        </div>
      </div>
      <div>
        <h2>${t("footfallTitle")}</h2>
        <p class="sub">${t("footfallSub")}</p>
        <canvas id="footfallCanvas" height="140"></canvas>
        <div class="inline-form">
          <label>${t("todaysFootfall")}</label>
          <input type="number" id="footfallInput" min="0" value="" />
          <button class="btn" id="saveFootfall">${t("add")}</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>${t("stockTitle")}</h2>
      <p class="sub">${t("stockSub")}</p>
      <table class="reg-table">
        <thead><tr>
          <th>${t("medicine")}</th><th>${t("stock")}</th><th>${t("threshold")}</th><th>${t("daysLeft")}</th><th>${t("status")}</th><th></th>
        </tr></thead>
        <tbody>
          ${centre.medicines
            .map((m, i) => {
              const status = stockStatus(m);
              const dl = daysLeft(m);
              return `<tr>
                <td>${m.name}</td>
                <td><input type="number" min="0" class="mini-input" id="medStock_${i}" value="${m.stock}" /> ${m.unit}</td>
                <td>${m.threshold}</td>
                <td>${isFinite(dl) ? dl.toFixed(1) : "—"}</td>
                <td><span class="pill pill-${status === "out" ? "out" : status === "low" ? "low" : "ok"}">${statusLabel(status)}</span></td>
                <td><button class="btn-sm" data-med="${i}">${t("update")}</button></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>

    <section class="panel two-col">
      <div>
        <h2>${t("doctorTitle")}</h2>
        <p class="sub">${t("doctorSub")}</p>
        <table class="reg-table">
          <thead><tr><th>${t("doctor")}</th><th>${t("weekAttendance")}</th><th>${t("present")}</th></tr></thead>
          <tbody>
            ${centre.doctors
              .map(
                (d, i) => `<tr>
                <td>${d.name}</td>
                <td class="week-dots">${d.attendanceWeek.map((p) => `<span class="dot ${p ? "dot-on" : "dot-off"}"></span>`).join("")}</td>
                <td><input type="checkbox" id="docToday_${i}" ${d.todayPresent ? "checked" : ""} /></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div>
        <h2>${t("testTitle")}</h2>
        <p class="sub">${t("testSub")}</p>
        <table class="reg-table">
          <thead><tr><th>${t("test")}</th><th>${t("availableQ")}</th></tr></thead>
          <tbody>
            ${centre.tests
              .map(
                (tst, i) => `<tr>
                <td>${tst.name}</td>
                <td><input type="checkbox" id="test_${i}" ${tst.available ? "checked" : ""} /></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("centreSelect").addEventListener("change", (e) => {
    activeCentreId = e.target.value;
    render();
  });

  document.getElementById("saveBed").addEventListener("click", () => {
    const val = Math.max(0, Math.min(centre.bedTotal, +document.getElementById("bedInput").value));
    centre.bedOccupied = val;
    saveDistrict(district);
    render();
  });

  document.getElementById("saveFootfall").addEventListener("click", () => {
    const val = +document.getElementById("footfallInput").value;
    if (!isNaN(val) && val >= 0) {
      centre.footfall.push(val);
      centre.footfall.shift();
      saveDistrict(district);
      render();
    }
  });

  root.querySelectorAll("[data-med]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = +btn.dataset.med;
      const val = +document.getElementById(`medStock_${i}`).value;
      centre.medicines[i].stock = Math.max(0, val);
      saveDistrict(district);
      render();
    });
  });

  centre.doctors.forEach((d, i) => {
    document.getElementById(`docToday_${i}`).addEventListener("change", (e) => {
      d.todayPresent = e.target.checked;
      d.attendanceWeek[6] = e.target.checked;
      saveDistrict(district);
    });
  });

  centre.tests.forEach((tst, i) => {
    document.getElementById(`test_${i}`).addEventListener("change", (e) => {
      tst.available = e.target.checked;
      saveDistrict(district);
    });
  });

  drawFootfallChart(centre);
}

function drawFootfallChart(centre) {
  const ctx = document.getElementById("footfallCanvas");
  if (footfallChart) footfallChart.destroy();
  footfallChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: centre.footfall.map((_, i) => `D${i + 1}`),
      datasets: [
        {
          data: centre.footfall,
          borderColor: "#0f6e5b",
          backgroundColor: "rgba(15,110,91,0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { beginAtZero: true } },
    },
  });
}

// ---------- forecast ----------

function renderForecast() {
  root.innerHTML = `
    <section class="panel">
      <h2>${t("forecastTitle")}</h2>
      <p class="sub">${t("forecastSub")}</p>
      <p class="note">${t("forecastNote")}</p>
      <table class="reg-table">
        <thead><tr>
          <th>${t("selectCentre")}</th><th>${t("medicine")}</th><th>${t("currentStock")}</th>
          <th>${t("projectedDemand")}</th><th>${t("verdict")}</th>
        </tr></thead>
        <tbody id="forecastBody"></tbody>
      </table>
    </section>
  `;

  const rows = [];
  district.centres.forEach((c) => {
    c.medicines.forEach((m) => {
      const f = forecastMedicine(c, m);
      rows.push({ centre: c, med: m, f });
    });
  });
  rows.sort((a, b) => a.f.daysLeft - b.f.daysLeft);

  document.getElementById("forecastBody").innerHTML = rows
    .slice(0, 24)
    .map(({ centre, med, f }) => {
      const verdict = f.willRunOutWithinWeek
        ? `${t("willRunOut")} ${Math.max(0, f.daysLeft).toFixed(1)} ${t("days")}`
        : t("sufficient");
      return `<tr>
        <td>${centre.name}</td>
        <td>${med.name}</td>
        <td>${med.stock} ${med.unit}</td>
        <td>${f.projected7Day} ${med.unit}</td>
        <td><span class="pill ${f.willRunOutWithinWeek ? "pill-out" : "pill-ok"}">${verdict}</span></td>
      </tr>`;
    })
    .join("");
}

// ---------- redistribution ----------

function renderRedistribute() {
  const suggestions = redistributionSuggestions(JSON.parse(JSON.stringify(district)));
  root.innerHTML = `
    <section class="panel">
      <h2>${t("redistTitle")}</h2>
      <p class="sub">${t("redistSub")}</p>
      ${
        suggestions.length === 0
          ? `<p class="empty">${t("noSuggestions")}</p>`
          : `<table class="reg-table">
        <thead><tr>
          <th>${t("medicine")}</th><th>${t("from")}</th><th>${t("to")}</th><th>${t("suggestedQty")}</th>
        </tr></thead>
        <tbody>
          ${suggestions
            .map(
              (s) => `<tr>
            <td>${s.medicine}</td>
            <td>${s.fromName}</td>
            <td>${s.toName}</td>
            <td><strong>${s.qty}</strong> ${s.unit}</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>`
      }
    </section>
  `;
}

// ---------- flagged centres ----------

function renderFlagged() {
  const flagged = district.centres
    .map((c) => ({ c, score: centreScore(c), flags: centreFlags(c) }))
    .filter((x) => x.flags.length > 0)
    .sort((a, b) => a.score - b.score);

  root.innerHTML = `
    <section class="panel">
      <h2>${t("flaggedTitle")}</h2>
      <p class="sub">${t("flaggedSub")}</p>
      ${
        flagged.length === 0
          ? `<p class="empty">${t("noneFlagged")}</p>`
          : flagged
              .map(
                (x) => `<div class="flag-card">
          <div class="flag-head">
            <div>
              <strong>${x.c.name}</strong><span class="muted"> · ${x.c.block}</span>
            </div>
            <span class="pill pill-out">${t("score")}: ${x.score}</span>
          </div>
          <div class="flag-reasons">${x.flags.map((f) => `<span class="chip">${t(f)}</span>`).join("")}</div>
          <button class="btn-sm notify-btn" data-id="${x.c.id}">${t("notifyAdmin")}</button>
        </div>`
              )
              .join("")
      }
    </section>
  `;

  root.querySelectorAll(".notify-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.textContent = t("notified");
      btn.disabled = true;
    });
  });
}

// ---------- init ----------

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.lang = getLang();
  render();
});
