/**
 * Nigerian Higher Institutions Directory
 * Curated from officially recognized institutions:
 *  - NUC (National Universities Commission) — universities
 *  - NBTE (National Board for Technical Education) — polytechnics, monotechnics, IEIs
 *  - NCCE (National Commission for Colleges of Education) — colleges of education
 *
 * Each entry: { name, short, type, state, popular? }
 * type ∈ federal_university | state_university | private_university | polytechnic | college_of_education | monotechnic | innovation_enterprise
 */

export const INSTITUTION_TYPES = [
  { key: "federal_university", label: "Federal University", color: "#0B1F4D" },
  { key: "state_university", label: "State University", color: "#0E7C5A" },
  { key: "private_university", label: "Private University", color: "#7C3AED" },
  { key: "polytechnic", label: "Polytechnic", color: "#B45309" },
  { key: "college_of_education", label: "College of Education", color: "#1D4ED8" },
  { key: "monotechnic", label: "Monotechnic", color: "#0F766E" },
  { key: "innovation_enterprise", label: "Innovation Enterprise", color: "#BE185D" },
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const INSTITUTIONS = [
  // ── Federal Universities (NUC) ──
  { name: "University of Lagos", short: "UNILAG", type: "federal_university", state: "Lagos", popular: true },
  { name: "University of Ibadan", short: "UI", type: "federal_university", state: "Oyo", popular: true },
  { name: "Obafemi Awolowo University", short: "OAU", type: "federal_university", state: "Osun", popular: true },
  { name: "Ahmadu Bello University", short: "ABU", type: "federal_university", state: "Kaduna", popular: true },
  { name: "University of Nigeria, Nsukka", short: "UNN", type: "federal_university", state: "Enugu", popular: true },
  { name: "University of Benin", short: "UNIBEN", type: "federal_university", state: "Edo", popular: true },
  { name: "University of Port Harcourt", short: "UNIPORT", type: "federal_university", state: "Rivers", popular: true },
  { name: "University of Calabar", short: "UNICAL", type: "federal_university", state: "Cross River" },
  { name: "University of Uyo", short: "UNIUYO", type: "federal_university", state: "Akwa Ibom" },
  { name: "University of Ilorin", short: "UNILORIN", type: "federal_university", state: "Kwara", popular: true },
  { name: "University of Jos", short: "UNIJOS", type: "federal_university", state: "Plateau" },
  { name: "University of Maiduguri", short: "UNIMAID", type: "federal_university", state: "Borno" },
  { name: "University of Abuja", short: "UNIABUJA", type: "federal_university", state: "FCT" },
  { name: "Federal University of Technology, Akure", short: "FUTA", type: "federal_university", state: "Ondo", popular: true },
  { name: "Federal University of Technology, Minna", short: "FUTMINNA", type: "federal_university", state: "Niger" },
  { name: "Federal University of Technology, Owerri", short: "FUTO", type: "federal_university", state: "Imo" },
  { name: "Michael Okpara University of Agriculture, Umudike", short: "MOUAU", type: "federal_university", state: "Abia" },
  { name: "Federal University of Agriculture, Abeokuta", short: "FUNAAB", type: "federal_university", state: "Ogun" },
  { name: "Nnamdi Azikiwe University, Awka", short: "UNIZIK", type: "federal_university", state: "Anambra", popular: true },
  { name: "Abubakar Tafawa Balewa University, Bauchi", short: "ATBU", type: "federal_university", state: "Bauchi" },
  { name: "Modibbo Adama University of Technology, Yola", short: "MAUTECH", type: "federal_university", state: "Adamawa" },
  { name: "University of Medical Sciences, Ondo", short: "UNIMED", type: "federal_university", state: "Ondo" },
  { name: "Federal University of Petroleum Resources, Effurun", short: "FUPRE", type: "federal_university", state: "Delta" },
  { name: "Federal University, Dutse", short: "FUD", type: "federal_university", state: "Jigawa" },
  { name: "Federal University, Dutsin-Ma", short: "FUDMA", type: "federal_university", state: "Katsina" },
  { name: "Federal University, Kashere", short: "FUK", type: "federal_university", state: "Gombe" },
  { name: "Federal University, Lafia", short: "FULAFIA", type: "federal_university", state: "Nasarawa" },
  { name: "Federal University, Lokoja", short: "FULOKOJA", type: "federal_university", state: "Kogi" },
  { name: "Alex Ekwueme Federal University, Ndufu-Alike", short: "AE-FUNAI", type: "federal_university", state: "Ebonyi" },
  { name: "Federal University, Otuoke", short: "FUOTUOKE", type: "federal_university", state: "Bayelsa" },
  { name: "Federal University, Birnin Kebbi", short: "FUBK", type: "federal_university", state: "Kebbi" },
  { name: "Federal University, Gashua", short: "FUGASHUA", type: "federal_university", state: "Yobe" },
  { name: "Federal University, Gusau", short: "FUGUS", type: "federal_university", state: "Zamfara" },
  { name: "Federal University, Oye-Ekiti", short: "FUOYE", type: "federal_university", state: "Ekiti" },
  { name: "Federal University, Wukari", short: "FUWUKARI", type: "federal_university", state: "Taraba" },
  { name: "Nigerian Defence Academy, Kaduna", short: "NDA", type: "federal_university", state: "Kaduna" },
  { name: "Nigerian Police Academy, Wudil", short: "POLAC", type: "federal_university", state: "Kano" },
  { name: "Nigerian Army University, Biu", short: "NAUB", type: "federal_university", state: "Borno" },
  { name: "Air Force Institute of Technology, Kaduna", short: "AFIT", type: "federal_university", state: "Kaduna" },
  { name: "Federal University of Health Sciences, Ila-Orangun", short: "FUHSI", type: "federal_university", state: "Osun" },
  { name: "Federal University of Health Sciences, Otukpo", short: "FUHSO", type: "federal_university", state: "Benue" },
  { name: "Federal University of Transportation, Daura", short: "FUTD", type: "federal_university", state: "Katsina" },
  { name: "Joseph Sarwuan Tarka University, Makurdi", short: "JOSTUM", type: "federal_university", state: "Benue" },

  // ── State Universities ──
  { name: "Lagos State University", short: "LASU", type: "state_university", state: "Lagos", popular: true },
  { name: "Olabisi Onabanjo University", short: "OOU", type: "state_university", state: "Ogun" },
  { name: "Adekunle Ajasin University, Akungba", short: "AAUA", type: "state_university", state: "Ondo" },
  { name: "Ekiti State University", short: "EKSU", type: "state_university", state: "Ekiti" },
  { name: "Ladoke Akintola University of Technology", short: "LAUTECH", type: "state_university", state: "Oyo" },
  { name: "Ambrose Alli University, Ekpoma", short: "AAU", type: "state_university", state: "Edo" },
  { name: "Delta State University, Abraka", short: "DELSU", type: "state_university", state: "Delta" },
  { name: "Imo State University", short: "IMSU", type: "state_university", state: "Imo" },
  { name: "Abia State University, Uturu", short: "ABSU", type: "state_university", state: "Abia" },
  { name: "Chukwuemeka Odumegwu Ojukwu University, Uli", short: "COOU", type: "state_university", state: "Anambra" },
  { name: "Enugu State University of Science and Technology", short: "ESUT", type: "state_university", state: "Enugu" },
  { name: "Nasarawa State University, Keffi", short: "NSUK", type: "state_university", state: "Nasarawa" },
  { name: "Benue State University, Makurdi", short: "BSU", type: "state_university", state: "Benue" },
  { name: "Kogi State University, Anyigba", short: "KSU", type: "state_university", state: "Kogi" },
  { name: "Taraba State University, Jalingo", short: "TASU", type: "state_university", state: "Taraba" },
  { name: "Adamawa State University, Mubi", short: "ADSU", type: "state_university", state: "Adamawa" },
  { name: "Gombe State University", short: "GSU", type: "state_university", state: "Gombe" },
  { name: "Bauchi State University, Gadau", short: "BASUG", type: "state_university", state: "Bauchi" },
  { name: "Kebbi State University of Science and Technology, Aliero", short: "KSUSTA", type: "state_university", state: "Kebbi" },
  { name: "Kano University of Science and Technology, Wudil", short: "KUST", type: "state_university", state: "Kano" },
  { name: "Sokoto State University", short: "SSU", type: "state_university", state: "Sokoto" },
  { name: "Zamfara State University, Talata-Mafara", short: "ZAMSUT", type: "state_university", state: "Zamfara" },
  { name: "Yobe State University, Damaturu", short: "YSU", type: "state_university", state: "Yobe" },
  { name: "Borno State University, Maiduguri", short: "BOUNI", type: "state_university", state: "Borno" },
  { name: "Akwa Ibom State University", short: "AKSU", type: "state_university", state: "Akwa Ibom" },
  { name: "University of Cross River State", short: "UNICROSS", type: "state_university", state: "Cross River" },
  { name: "Rivers State University", short: "RSU", type: "state_university", state: "Rivers" },
  { name: "Osun State University", short: "UNIOSUN", type: "state_university", state: "Osun" },
  { name: "Tai Solarin University of Education", short: "TASUED", type: "state_university", state: "Ogun" },
  { name: "Ignatius Ajuru University of Education", short: "IAUE", type: "state_university", state: "Rivers" },
  { name: "Ibrahim Badamasi Babangida University, Lapai", short: "IBBUL", type: "state_university", state: "Niger" },
  { name: "Kwara State University, Malete", short: "KWASU", type: "state_university", state: "Kwara" },
  { name: "Plateau State University, Bokkos", short: "PLASU", type: "state_university", state: "Plateau" },
  { name: "Umaru Musa Yar'adua University", short: "UMYU", type: "state_university", state: "Katsina" },
  { name: "Ondo State University of Science and Technology, Okitipupa", short: "OSUSTECH", type: "state_university", state: "Ondo" },

  // ── Private Universities ──
  { name: "Covenant University", short: "CU", type: "private_university", state: "Ogun", popular: true },
  { name: "Babcock University", short: "BU", type: "private_university", state: "Ogun", popular: true },
  { name: "Redeemer's University", short: "RUN", type: "private_university", state: "Osun" },
  { name: "Bowen University", short: "BIU", type: "private_university", state: "Osun" },
  { name: "Ajayi Crowther University", short: "ACU", type: "private_university", state: "Oyo" },
  { name: "Pan-Atlantic University", short: "PAU", type: "private_university", state: "Lagos", popular: true },
  { name: "American University of Nigeria", short: "AUN", type: "private_university", state: "Adamawa" },
  { name: "Afe Babalola University", short: "ABUAD", type: "private_university", state: "Ekiti" },
  { name: "Al-Hikmah University", short: "ALHIKMAH", type: "private_university", state: "Kwara" },
  { name: "Baze University", short: "BAZE", type: "private_university", state: "FCT" },
  { name: "Bells University of Technology", short: "BELLSTECH", type: "private_university", state: "Ogun" },
  { name: "Caritas University", short: "CARITAS", type: "private_university", state: "Enugu" },
  { name: "Christopher University", short: "CHRISLAND", type: "private_university", state: "Lagos" },
  { name: "Crawford University", short: "CRAWFORD", type: "private_university", state: "Ogun" },
  { name: "Crescent University", short: "CRESCENT", type: "private_university", state: "Ogun" },
  { name: "Dominican University", short: "DU", type: "private_university", state: "Oyo" },
  { name: "Edwin Clark University", short: "ECU", type: "private_university", state: "Delta" },
  { name: "Elizade University", short: "EU", type: "private_university", state: "Ondo" },
  { name: "Fountain University", short: "FU", type: "private_university", state: "Osun" },
  { name: "Gregory University", short: "GUN", type: "private_university", state: "Abia" },
  { name: "Hallmark University", short: "HALLMARK", type: "private_university", state: "Ogun" },
  { name: "Igbinedion University", short: "IUO", type: "private_university", state: "Edo" },
  { name: "Joseph Ayo Babalola University", short: "JABU", type: "private_university", state: "Osun" },
  { name: "Kola Daisi University", short: "KDU", type: "private_university", state: "Oyo" },
  { name: "Lead City University", short: "LCU", type: "private_university", state: "Oyo" },
  { name: "Madonna University", short: "MU", type: "private_university", state: "Rivers" },
  { name: "McPherson University", short: "MCU", type: "private_university", state: "Ogun" },
  { name: "Mountain Top University", short: "MTU", type: "private_university", state: "Lagos" },
  { name: "Nile University of Nigeria", short: "NILE", type: "private_university", state: "FCT" },
  { name: "Novena University", short: "NU", type: "private_university", state: "Delta" },
  { name: "Oduduwa University", short: "ODUDUWA", type: "private_university", state: "Osun" },
  { name: "PAMO University of Medical Sciences", short: "PUMS", type: "private_university", state: "Rivers" },
  { name: "Paul University", short: "PU", type: "private_university", state: "Anambra" },
  { name: "Renaissance University", short: "RNU", type: "private_university", state: "Enugu" },
  { name: "Rhema University", short: "RU", type: "private_university", state: "Abia" },
  { name: "Salem University", short: "SALEM", type: "private_university", state: "Kogi" },
  { name: "Southwestern University", short: "SWU", type: "private_university", state: "Ogun" },
  { name: "Tansian University", short: "TANU", type: "private_university", state: "Anambra" },
  { name: "Trinity University", short: "TU", type: "private_university", state: "Lagos" },
  { name: "Wellspring University", short: "WU", type: "private_university", state: "Edo" },
  { name: "Western Delta University", short: "WDU", type: "private_university", state: "Delta" },
  { name: "Achievers University", short: "ACHIEVERS", type: "private_university", state: "Ondo" },
  { name: "Adeleke University", short: "AU", type: "private_university", state: "Osun" },
  { name: "Atiba University", short: "ATIBA", type: "private_university", state: "Oyo" },

  // ── Polytechnics (NBTE) ──
  { name: "Yaba College of Technology", short: "YABATECH", type: "polytechnic", state: "Lagos", popular: true },
  { name: "Federal Polytechnic, Auchi", short: "AUCHIPOLY", type: "polytechnic", state: "Edo", popular: true },
  { name: "Federal Polytechnic, Bida", short: "BIDAPOLY", type: "polytechnic", state: "Niger" },
  { name: "Federal Polytechnic, Ado-Ekiti", short: "FEDPOLYADO", type: "polytechnic", state: "Ekiti" },
  { name: "Federal Polytechnic, Bauchi", short: "FEDPOLYBAU", type: "polytechnic", state: "Bauchi" },
  { name: "Federal Polytechnic, Damaturu", short: "FEDPOLYDAM", type: "polytechnic", state: "Yobe" },
  { name: "Federal Polytechnic, Idah", short: "FEDPOLYIDAH", type: "polytechnic", state: "Kogi" },
  { name: "Federal Polytechnic, Ilaro", short: "FEDPOLYILARO", type: "polytechnic", state: "Ogun" },
  { name: "Federal Polytechnic, Mubi", short: "FEDPOLYMUBI", type: "polytechnic", state: "Adamawa" },
  { name: "Federal Polytechnic, Nassarawa", short: "FEDPOLYNAS", type: "polytechnic", state: "Nasarawa" },
  { name: "Federal Polytechnic, Nekede", short: "FEDPOLYNEK", type: "polytechnic", state: "Imo" },
  { name: "Federal Polytechnic, Offa", short: "FEDPOLYOFFA", type: "polytechnic", state: "Kwara" },
  { name: "Federal Polytechnic, Oko", short: "FEDPOLYOKO", type: "polytechnic", state: "Anambra" },
  { name: "Akanu Ibiam Federal Polytechnic, Unwana", short: "AIFPU", type: "polytechnic", state: "Ebonyi" },
  { name: "Hussaini Adamu Federal Polytechnic, Kazaure", short: "HAFEDPOLY", type: "polytechnic", state: "Jigawa" },
  { name: "Kaduna Polytechnic", short: "KADPOLY", type: "polytechnic", state: "Kaduna", popular: true },
  { name: "The Polytechnic, Ibadan", short: "IBADANPOLY", type: "polytechnic", state: "Oyo", popular: true },
  { name: "Moshood Abiola Polytechnic", short: "MAPOLY", type: "polytechnic", state: "Ogun" },
  { name: "Rufus Giwa Polytechnic, Owo", short: "RUGIPO", type: "polytechnic", state: "Ondo" },
  { name: "Osun State Polytechnic, Iree", short: "OSPOLY", type: "polytechnic", state: "Osun" },
  { name: "Osun State College of Technology, Esa-Oke", short: "OSCOTECH", type: "polytechnic", state: "Osun" },
  { name: "Gateway Polytechnic, Saapade", short: "GATEWAYPOLY", type: "polytechnic", state: "Ogun" },
  { name: "Lagos State University of Science and Technology", short: "LASUSTECH", type: "polytechnic", state: "Lagos" },
  { name: "Benue State Polytechnic, Ugbokolo", short: "BENUEPOLY", type: "polytechnic", state: "Benue" },
  { name: "Imo State Polytechnic", short: "IMOPOLY", type: "polytechnic", state: "Imo" },
  { name: "Abia State Polytechnic, Aba", short: "ABIAPOLY", type: "polytechnic", state: "Abia" },

  // ── Colleges of Education (NCCE) ──
  { name: "Alvan Ikoku Federal College of Education", short: "AIFCE", type: "college_of_education", state: "Imo", popular: true },
  { name: "Federal College of Education, Kano", short: "FCEKANO", type: "college_of_education", state: "Kano" },
  { name: "Federal College of Education (Technical), Bichi", short: "FCEBICHI", type: "college_of_education", state: "Kano" },
  { name: "Federal College of Education (Technical), Omoku", short: "FCEOMOKU", type: "college_of_education", state: "Rivers" },
  { name: "Federal College of Education (Technical), Asaba", short: "FCEASABA", type: "college_of_education", state: "Delta" },
  { name: "Federal College of Education, Eha-Amufu", short: "FCEAMUFU", type: "college_of_education", state: "Enugu" },
  { name: "Federal College of Education, Katsina", short: "FCEKATSINA", type: "college_of_education", state: "Katsina" },
  { name: "Federal College of Education, Kontagora", short: "FCEKONTA", type: "college_of_education", state: "Niger" },
  { name: "Federal College of Education, Okene", short: "FCEOKENE", type: "college_of_education", state: "Kogi" },
  { name: "Federal College of Education, Pankshin", short: "FCEPANKSHIN", type: "college_of_education", state: "Plateau" },
  { name: "Federal College of Education, Yola", short: "FCEYOLA", type: "college_of_education", state: "Adamawa" },
  { name: "Federal College of Education, Zaria", short: "FCEZARIA", type: "college_of_education", state: "Kaduna" },
  { name: "Adeniran Ogunsanya College of Education", short: "AOCOED", type: "college_of_education", state: "Lagos" },
  { name: "Michael Otedola College of Primary Education", short: "MOCPED", type: "college_of_education", state: "Lagos" },
  { name: "Emmanuel Alayande College of Education, Oyo", short: "EACOED", type: "college_of_education", state: "Oyo" },
  { name: "Kwara State College of Education, Ilorin", short: "COEILORIN", type: "college_of_education", state: "Kwara" },
  { name: "Niger State College of Education, Minna", short: "COEMINNA", type: "college_of_education", state: "Niger" },
  { name: "Shehu Shagari College of Education, Sokoto", short: "SSCOE", type: "college_of_education", state: "Sokoto" },
  { name: "Sa'adatu Rimi College of Education, Kumbotso", short: "SRCOE", type: "college_of_education", state: "Kano" },
  { name: "College of Education, Ikere-Ekiti", short: "COEIKERE", type: "college_of_education", state: "Ekiti" },

  // ── Monotechnics (NBTE) ──
  { name: "Petroleum Training Institute, Effurun", short: "PTI", type: "monotechnic", state: "Delta" },
  { name: "Federal College of Freshwater Fisheries Technology, New Bussa", short: "FCFFT", type: "monotechnic", state: "Niger" },
  { name: "Federal College of Agriculture, Ibadan", short: "FCAIB", type: "monotechnic", state: "Oyo" },
  { name: "Federal College of Animal Health and Production Technology, Moor Plantation", short: "FCAHPT", type: "monotechnic", state: "Oyo" },
  { name: "Federal College of Wildlife Management, New Bussa", short: "FCWM", type: "monotechnic", state: "Niger" },

  // ── Innovation Enterprise Institutions (NBTE) ──
  { name: "Grace Polytechnic, Surulere", short: "GRACEPOLY", type: "innovation_enterprise", state: "Lagos" },
  { name: "Lagos City Polytechnic", short: "LCP", type: "innovation_enterprise", state: "Lagos" },
  { name: "Kalacristal Polytechnic", short: "KALACRISTAL", type: "innovation_enterprise", state: "Lagos" },
];

export const INSTITUTION_TYPE_LABELS = Object.fromEntries(
  INSTITUTION_TYPES.map((t) => [t.key, t.label])
);
export const INSTITUTION_TYPE_COLORS = Object.fromEntries(
  INSTITUTION_TYPES.map((t) => [t.key, t.color])
);

export const POPULAR_INSTITUTIONS = INSTITUTIONS.filter((i) => i.popular);

export function searchInstitutions(query, { type, state } = {}) {
  const q = query.trim().toLowerCase();
  return INSTITUTIONS.filter((i) => {
    if (type && i.type !== type) return false;
    if (state && i.state !== state) return false;
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.short.toLowerCase().includes(q) ||
      i.state.toLowerCase().includes(q)
    );
  });
}

export function getInstitutionsByState(state) {
  return INSTITUTIONS.filter((i) => i.state === state);
}

export function getInstitutionsByType(type) {
  return INSTITUTIONS.filter((i) => i.type === type);
}

export function getAlphabeticalGroups(list) {
  const groups = {};
  list
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((i) => {
      const letter = (i.name.replace(/^The\s+/i, "")[0] || "#").toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      (groups[key] ||= []).push(i);
    });
  return Object.keys(groups)
    .sort()
    .map((letter) => ({ letter, items: groups[letter] }));
}

const RECENT_KEY = "unibud:recent_institutions";
export function getRecentInstitutions(limit = 5) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
}
export function addRecentInstitution(institution) {
  try {
    const existing = getRecentInstitutions(20).filter((i) => i.name !== institution.name);
    const next = [{ name: institution.name, short: institution.short, type: institution.type, state: institution.state }, ...existing];
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 20)));
  } catch {}
}