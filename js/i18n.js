// ============================================================
// i18n.js — English / Hindi dictionary + helper
// Every user-facing string in the app is looked up through t('key')
// so the whole UI can flip language instantly without reloading.
// ============================================================

const DICT = {
  en: {
    appName: "SwasthyaNet",
    appTag: "District Health Command Register",
    navOverview: "District Overview",
    navCenter: "Centre Register",
    navForecast: "AI Forecast",
    navRedistribute: "Redistribution",
    navFlagged: "Flagged Centres",
    langToggle: "हिं",
    lastUpdated: "Last updated",
    liveDemo: "Live demo data — resets any time you clear this browser",

    // overview
    centresTracked: "Centres tracked",
    stockoutsToday: "Active stock-outs",
    avgBedOcc: "Avg. bed occupancy",
    avgAttendance: "Avg. doctor attendance",
    pulseStrip: "Facility Pulse",
    pulseHint: "One heartbeat per centre — red skips a beat when it's in trouble",
    critical: "Critical",
    warning: "Warning",
    stable: "Stable",
    districtMap: "Block-wise standing",

    // centre selector
    selectCentre: "Select a centre to open its register",
    typePHC: "PHC",
    typeCHC: "CHC",
    beds: "Beds",
    occupied: "Occupied",
    available: "Available",
    updateOccupied: "Update occupied beds",
    save: "Save",
    saved: "Saved",

    footfallTitle: "Patient Footfall",
    footfallSub: "Last 14 days — enter today's count to keep the trend live",
    todaysFootfall: "Today's footfall",
    add: "Add",

    stockTitle: "Medicine Stock Register",
    stockSub: "Update stock after every dispensation or delivery",
    medicine: "Medicine",
    stock: "Stock",
    threshold: "Threshold",
    daysLeft: "Days left",
    status: "Status",
    update: "Update",
    ok: "OK",
    low: "Low",
    out: "Stock-out",

    doctorTitle: "Doctor Attendance",
    doctorSub: "Mark today's attendance — this feeds the district roll-up",
    doctor: "Doctor",
    scheduled: "Scheduled",
    present: "Present",
    absent: "Absent",
    weekAttendance: "7-day attendance",

    testTitle: "Diagnostic Test Availability Audit",
    testSub: "Toggle whether each test can be performed today",
    test: "Test",
    availableQ: "Available today?",

    // forecast
    forecastTitle: "AI-Driven Demand Forecast",
    forecastSub: "Projected 7-day consumption vs. current stock, per centre",
    forecastNote: "Forecast = recent daily consumption trend × 7, adjusted for footfall growth",
    projectedDemand: "Projected 7-day demand",
    currentStock: "Current stock",
    verdict: "Verdict",
    willRunOut: "Will run out in",
    days: "days",
    sufficient: "Sufficient",

    // redistribution
    redistTitle: "Smart Resource Redistribution",
    redistSub: "Centres with surplus matched against centres about to run out",
    from: "From (surplus)",
    to: "To (needs stock)",
    suggestedQty: "Suggested transfer",
    noSuggestions: "No redistribution needed right now — all centres are within safe range.",

    // flagged
    flaggedTitle: "Underperforming / Under-resourced Centres",
    flaggedSub: "Composite score from stock-outs, bed strain, doctor attendance and test gaps",
    score: "Health-ops score",
    reasons: "Flagged for",
    notifyAdmin: "Notify district admin",
    notified: "Admin notified",
    reasonStock: "Recurring stock-outs",
    reasonBeds: "Bed strain (near full)",
    reasonDoctor: "Low doctor attendance",
    reasonTest: "Test availability gaps",
    noneFlagged: "No centres currently flagged — district is operating within thresholds.",

    footer: "Built for Code for Communities — Smart Health prototype",
  },

  hi: {
    appName: "स्वास्थ्यनेट",
    appTag: "ज़िला स्वास्थ्य कमांड रजिस्टर",
    navOverview: "ज़िला अवलोकन",
    navCenter: "केंद्र रजिस्टर",
    navForecast: "एआई पूर्वानुमान",
    navRedistribute: "पुनर्वितरण",
    navFlagged: "चिह्नित केंद्र",
    langToggle: "EN",
    lastUpdated: "अंतिम अद्यतन",
    liveDemo: "लाइव डेमो डेटा — ब्राउज़र साफ़ करने पर रीसेट हो जाएगा",

    centresTracked: "ट्रैक किए गए केंद्र",
    stockoutsToday: "सक्रिय स्टॉक-आउट",
    avgBedOcc: "औसत बेड अधिभोग",
    avgAttendance: "औसत डॉक्टर उपस्थिति",
    pulseStrip: "केंद्र नब्ज़ पट्टी",
    pulseHint: "प्रत्येक केंद्र की एक धड़कन — परेशानी में लाल धड़कन रुकती है",
    critical: "गंभीर",
    warning: "चेतावनी",
    stable: "स्थिर",
    districtMap: "ब्लॉक-वार स्थिति",

    selectCentre: "रजिस्टर खोलने के लिए केंद्र चुनें",
    typePHC: "पीएचसी",
    typeCHC: "सीएचसी",
    beds: "बेड",
    occupied: "भरे हुए",
    available: "उपलब्ध",
    updateOccupied: "भरे हुए बेड अपडेट करें",
    save: "सहेजें",
    saved: "सहेजा गया",

    footfallTitle: "मरीज़ों की आमद",
    footfallSub: "पिछले 14 दिन — रुझान ताज़ा रखने के लिए आज की संख्या जोड़ें",
    todaysFootfall: "आज की आमद",
    add: "जोड़ें",

    stockTitle: "दवा स्टॉक रजिस्टर",
    stockSub: "हर वितरण या डिलीवरी के बाद स्टॉक अपडेट करें",
    medicine: "दवा",
    stock: "स्टॉक",
    threshold: "सीमा",
    daysLeft: "बचे दिन",
    status: "स्थिति",
    update: "अपडेट",
    ok: "ठीक",
    low: "कम",
    out: "स्टॉक-आउट",

    doctorTitle: "डॉक्टर उपस्थिति",
    doctorSub: "आज की उपस्थिति दर्ज करें — यह ज़िला सारांश में जुड़ेगी",
    doctor: "डॉक्टर",
    scheduled: "निर्धारित",
    present: "उपस्थित",
    absent: "अनुपस्थित",
    weekAttendance: "7-दिन उपस्थिति",

    testTitle: "जाँच उपलब्धता ऑडिट",
    testSub: "आज हर जाँच उपलब्ध है या नहीं, टॉगल करें",
    test: "जाँच",
    availableQ: "आज उपलब्ध?",

    forecastTitle: "एआई-आधारित मांग पूर्वानुमान",
    forecastSub: "प्रत्येक केंद्र के लिए 7-दिन की अनुमानित खपत बनाम वर्तमान स्टॉक",
    forecastNote: "पूर्वानुमान = हाल की दैनिक खपत का रुझान × 7, आमद वृद्धि के अनुसार समायोजित",
    projectedDemand: "अनुमानित 7-दिन मांग",
    currentStock: "वर्तमान स्टॉक",
    verdict: "निष्कर्ष",
    willRunOut: "इतने दिनों में खत्म होगा",
    days: "दिन",
    sufficient: "पर्याप्त",

    redistTitle: "स्मार्ट संसाधन पुनर्वितरण",
    redistSub: "अतिरिक्त वाले केंद्रों को कमी वाले केंद्रों से मिलाया गया",
    from: "से (अतिरिक्त)",
    to: "को (आवश्यकता)",
    suggestedQty: "सुझाया गया स्थानांतरण",
    noSuggestions: "अभी पुनर्वितरण की आवश्यकता नहीं — सभी केंद्र सुरक्षित सीमा में हैं।",

    flaggedTitle: "कमज़ोर / कम-संसाधन वाले केंद्र",
    flaggedSub: "स्टॉक-आउट, बेड दबाव, डॉक्टर उपस्थिति और जाँच अंतराल से बना समग्र स्कोर",
    score: "स्वास्थ्य-संचालन स्कोर",
    reasons: "इस कारण चिह्नित",
    notifyAdmin: "ज़िला प्रशासन को सूचित करें",
    notified: "प्रशासन सूचित",
    reasonStock: "बार-बार स्टॉक-आउट",
    reasonBeds: "बेड दबाव (लगभग भरा)",
    reasonDoctor: "कम डॉक्टर उपस्थिति",
    reasonTest: "जाँच उपलब्धता में कमी",
    noneFlagged: "फिलहाल कोई केंद्र चिह्नित नहीं — ज़िला सीमाओं के भीतर कार्यरत है।",

    footer: "Code for Communities के लिए — Smart Health प्रोटोटाइप",
  },
};

let currentLang = localStorage.getItem("sh_lang") || "en";

function t(key) {
  return (DICT[currentLang] && DICT[currentLang][key]) || DICT.en[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("sh_lang", lang);
  document.documentElement.lang = lang;
}

function getLang() {
  return currentLang;
}
