const LS_KEY = "resumeBuilder.v1";
const $ = (id) => document.getElementById(id);

function defaultState() {
    return {
        profile: {
            fullName: "Jane Doe",
            title: "Software Engineer",
            email: "jane@example.com",
            phone: "+1 555 000 1234",
            location: "San Francisco, CA",
            website: "jane.dev",
            linkedin: "linkedin.com/in/janedoe",
            github: "github.com/janedoe",
            photo: ""
        },
        summary:
            "Results-driven software engineer with 5+ years of experience building web applications. Passionate about clean code, performance, and great user experiences.",
        experience: [
            {
                jobTitle: "Frontend Developer",
                company: "Acme Corp",
                location: "Remote",
                start: "2021-03",
                end: "Present",
                bullets:
                    "- Built and shipped the customer dashboard used by 50k+ users\n- Led a team of 3 developers to revamp the design system\n- Improved page load times by 40%"
            },
            {
                jobTitle: "Web Developer",
                company: "Startup.io",
                location: "San Francisco, CA",
                start: "2019-06",
                end: "2021-02",
                bullets: "- Developed marketing sites and internal tools\n- Introduced automated testing, cutting regressions by half"
            }
        ],
        education: [
            {
                degree: "B.Sc. Computer Science",
                school: "State University",
                location: "Boston, MA",
                start: "2015",
                end: "2019",
                details: "Graduated with honors. Focus on web technologies and algorithms."
            }
        ],
        skills: [
            { name: "JavaScript", level: 5 },
            { name: "React", level: 4 },
            { name: "HTML / CSS", level: 5 },
            { name: "Node.js", level: 3 },
            { name: "Git", level: 4 },
            { name: "UI / UX", level: 3 }
        ],
        projects: [
            {
                name: "Resume Maker",
                link: "github.com/you/resume-maker",
                start: "2026",
                end: "Present",
                description:
                    "An offline resume builder with a live preview, multiple templates, and print-to-PDF export."
            }
        ],
        certifications: [
            { name: "AWS Certified Developer", issuer: "Amazon Web Services", year: "2025" }
        ],
        languages: [
            { name: "English", level: "Native" },
            { name: "Hindi", level: "Professional" }
        ],
        settings: {
            template: "classic",
            accent: "#2b3a67",
            fontSize: 14,
            spacing: "normal",
            showPhoto: true,
            sections: {
                summary: true,
                experience: true,
                education: true,
                skills: true,
                projects: true,
                certifications: true,
                languages: true
            }
        }
    };
}

const LIST_SECTIONS = ["experience", "education", "projects", "certifications", "languages"];
const SECTION_DEFS = [
    { key: "summary", label: "Summary" },
    { key: "experience", label: "Work Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "projects", label: "Projects" },
    { key: "certifications", label: "Certifications" },
    { key: "languages", label: "Languages" }
];
const NAV_ITEMS = [
    ["sec-settings", "Settings"],
    ["sec-profile", "Personal"],
    ["sec-summary", "Summary"],
    ["sec-experience", "Experience"],
    ["sec-education", "Education"],
    ["sec-skills", "Skills"],
    ["sec-projects", "Projects"],
    ["sec-certifications", "Certs"],
    ["sec-languages", "Languages"]
];

let state = defaultState();

const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function getByPath(path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state);
}

function setByPath(path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    let o = state;
    for (const k of keys) o = o[k];
    o[last] = value;
}

function newEntry(section) {
    const blank = { jobTitle: "", company: "", location: "", start: "", end: "", bullets: "" };
    if (section === "education") return { school: "", degree: "", location: "", start: "", end: "", details: "" };
    if (section === "projects") return { name: "", link: "", start: "", end: "", description: "" };
    if (section === "certifications") return { name: "", issuer: "", year: "" };
    if (section === "languages") return { name: "", level: "" };
    return blank;
}

function entryTitle(section, entry, i) {
    entry = entry || {};
    if (section === "experience") return entry.jobTitle || entry.company || `Experience ${i + 1}`;
    if (section === "education") return entry.degree || entry.school || `Education ${i + 1}`;
    if (section === "projects") return entry.name || `Project ${i + 1}`;
    if (section === "certifications") return entry.name || `Certification ${i + 1}`;
    if (section === "languages") return entry.name || `Language ${i + 1}`;
    return `Item ${i + 1}`;
}

/* ---------- persistence ---------- */

function loadState() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return normalizeState(JSON.parse(raw));
    } catch (err) {
        /* ignore corrupted storage */
    }
    return defaultState();
}

function persist() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (err) {
        toast("Storage full - your photo may be too large.");
    }
}

function normalizeState(data) {
    const d = defaultState();
    const s = data && typeof data === "object" ? data : {};
    const merged = {
        ...d,
        ...s,
        profile: { ...d.profile, ...(s.profile || {}) },
        settings: {
            ...d.settings,
            ...(s.settings || {}),
            sections: { ...d.settings.sections, ...((s.settings && s.settings.sections) || {}) }
        }
    };
    const accent = merged.settings.accent;
    merged.settings.accent = /^#[0-9a-fA-F]{6}$/.test(accent || "") ? accent.toLowerCase() : d.settings.accent;
    merged.settings.fontSize = Number(merged.settings.fontSize) || d.settings.fontSize;
    for (const k of LIST_SECTIONS) merged[k] = Array.isArray(s[k]) ? s[k] : d[k];
    if (!Array.isArray(s.skills)) merged.skills = d.skills;
    return merged;
}

/* ---------- rendering ---------- */

function applyState() {
    $("setTemplate").value = state.settings.template;
    $("setAccent").value = state.settings.accent;
    $("setFontSize").value = state.settings.fontSize;
    $("fontSizeOut").textContent = state.settings.fontSize;
    $("setSpacing").value = state.settings.spacing;
    renderSecToggles();
    for (const s of LIST_SECTIONS) renderList(s);
    renderSkills();
    applyPhoto();
    renderPreview();
}

function renderList(section) {
    const list = $(section + "List");
    list.innerHTML = "";
    state[section].forEach((entry, i) => {
        const node = $("section-tpl".replace("section", section)).content.cloneNode(true);
        const card = node.querySelector(".card");
        card.dataset.index = String(i);
        node.querySelectorAll("[data-path]").forEach((el) => {
            const path = el.dataset.path.replace("__i__", String(i));
            el.dataset.path = path;
            el.value = getByPath(path) ?? "";
        });
        node.querySelector(".card-title").textContent = entryTitle(section, entry, i);
        list.appendChild(node);
    });
}

function renderSkills() {
    const list = $("skillsList");
    list.innerHTML = "";
    state.skills.forEach((s, i) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        const level = Math.min(5, Math.max(0, Number(s.level) || 0));
        chip.innerHTML =
            `<span class="chip-name">${esc(s.name)}</span>` +
            `<span class="chip-dots">${"●".repeat(level)}<span class="off">${"●".repeat(5 - level)}</span></span>` +
            `<button class="chip-x" data-skill-x="${i}" title="Remove">×</button>`;
        list.appendChild(chip);
    });
}

function renderSecToggles() {
    const box = $("secToggles");
    box.innerHTML = "";
    SECTION_DEFS.forEach((d) => {
        const lab = document.createElement("label");
        lab.className = "checkbox";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!state.settings.sections[d.key];
        cb.dataset.path = "settings.sections." + d.key;
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(" " + d.label));
        box.appendChild(lab);
    });
}

function applyPhoto() {
    const img = $("photoPreview");
    const rm = $("photoRemove");
    if (state.profile.photo) {
        img.src = state.profile.photo;
        img.hidden = false;
        rm.hidden = false;
    } else {
        img.hidden = true;
        rm.hidden = true;
        img.removeAttribute("src");
    }
}

/* ---------- list mutations ---------- */

function addEntry(section) {
    state[section].push(newEntry(section));
    renderList(section);
    persist();
    schedulePreview();
    const list = $(section + "List");
    const card = list.lastElementChild;
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function removeEntry(section, i) {
    if (!Number.isInteger(i) || !state[section][i]) return;
    state[section].splice(i, 1);
    renderList(section);
    persist();
    schedulePreview();
}

function moveEntry(section, i, dir) {
    if (!Number.isInteger(i) || !state[section][i]) return;
    const arr = state[section];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    renderList(section);
    persist();
    schedulePreview();
}

/* ---------- preview ---------- */

let previewTimer;
function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 120);
}

function contactItems() {
    const p = state.profile;
    const items = [];
    if (p.email) items.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`);
    if (p.phone) items.push(`<span>${esc(p.phone)}</span>`);
    if (p.location) items.push(`<span>${esc(p.location)}</span>`);
    if (p.website) items.push(`<a href="${esc(/^https?:\/\//i.test(p.website) ? p.website : "https://" + p.website)}" target="_blank" rel="noopener">${esc(p.website)}</a>`);
    if (p.linkedin) items.push(`<a href="${esc(/^https?:\/\//i.test(p.linkedin) ? p.linkedin : "https://" + p.linkedin)}" target="_blank" rel="noopener">${esc(p.linkedin)}</a>`);
    if (p.github) items.push(`<a href="${esc(/^https?:\/\//i.test(p.github) ? p.github : "https://" + p.github)}" target="_blank" rel="noopener">${esc(p.github)}</a>`);
    return items;
}

function photoHTML() {
    if (!state.settings.showPhoto || !state.profile.photo) return "";
    return `<img class="rp-photo" src="${state.profile.photo}" alt="profile photo" />`;
}

function secTag(html, key) {
    return state.settings.sections[key] ? `<section class="rp-sec">${html}</section>` : "";
}
const h2 = (t) => `<h2 class="rp-h2">${esc(t)}</h2>`;

function htmlSummary() {
    return secTag(h2("Summary") + `<p class="rp-text">${state.summary}</p>`, "summary");
}

function htmlExperience() {
    if (!state.settings.sections.experience || !state.experience.length) return "";
    const items = state.experience
        .map((e) => {
            const range = [e.start, e.end].filter(Boolean).join(" – ");
            const loc = e.location ? ", " + esc(e.location) : "";
            const bullets = (e.bullets || "")
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
                .map((l) => `<li>${l.replace(/^[-•*]\s+/, "")}</li>`)
                .join("");
            return (
                `<div class="rp-item">` +
                `<div class="rp-item-head"><h3>${esc(e.jobTitle)}</h3>${range ? `<span class="rp-date">${esc(range)}</span>` : ""}</div>` +
                `<div class="rp-sub">${esc(e.company)}${loc}</div>` +
                (bullets ? `<ul class="rp-bullets">${bullets}</ul>` : "") +
                `</div>`
            );
        })
        .join("");
    return secTag(h2("Work Experience") + items, "experience");
}

function htmlEducation() {
    if (!state.settings.sections.education || !state.education.length) return "";
    const items = state.education
        .map((e) => {
            const range = [e.start, e.end].filter(Boolean).join(" – ");
            const loc = e.location ? ", " + esc(e.location) : "";
            return (
                `<div class="rp-item">` +
                `<div class="rp-item-head"><h3>${esc(e.degree)}</h3>${range ? `<span class="rp-date">${esc(range)}</span>` : ""}</div>` +
                `<div class="rp-sub">${esc(e.school)}${loc}</div>` +
                (e.details ? `<p class="rp-text">${e.details}</p>` : "") +
                `</div>`
            );
        })
        .join("");
    return secTag(h2("Education") + items, "education");
}

function htmlSkills() {
    if (!state.settings.sections.skills || !state.skills.length) return "";
    const chips = state.skills
        .map((s) => {
            const level = Math.min(5, Math.max(0, Number(s.level) || 0));
            return `<span class="rp-chip">${esc(s.name)}<span class="chip-dots">${"●".repeat(level)}<span class="off">${"●".repeat(5 - level)}</span></span></span>`;
        })
        .join("");
    return secTag(h2("Skills") + `<div class="rp-chips">${chips}</div>`, "skills");
}

function htmlProjects() {
    if (!state.settings.sections.projects || !state.projects.length) return "";
    const items = state.projects
        .map((p) => {
            const range = [p.start, p.end].filter(Boolean).join(" – ");
            const link = p.link
                ? `<div class="rp-link"><a href="${esc(/^https?:\/\//i.test(p.link) ? p.link : "https://" + p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a></div>`
                : "";
            return (
                `<div class="rp-item">` +
                `<div class="rp-item-head"><h3>${esc(p.name)}</h3>${range ? `<span class="rp-date">${esc(range)}</span>` : ""}</div>` +
                link +
                (p.description ? `<p class="rp-text">${p.description}</p>` : "") +
                `</div>`
            );
        })
        .join("");
    return secTag(h2("Projects") + items, "projects");
}

function htmlCertifications() {
    if (!state.settings.sections.certifications || !state.certifications.length) return "";
    const items = state.certifications
        .map((c) => {
            const sub = [c.issuer, c.year].filter(Boolean).join(" · ");
            return (
                `<div class="rp-item">` +
                `<div class="rp-item-head"><h3>${esc(c.name)}</h3>${c.year ? `<span class="rp-date">${esc(c.year)}</span>` : ""}</div>` +
                (sub ? `<div class="rp-sub">${esc(sub)}</div>` : "") +
                `</div>`
            );
        })
        .join("");
    return secTag(h2("Certifications") + items, "certifications");
}

function htmlLanguages() {
    if (!state.settings.sections.languages || !state.languages.length) return "";
    const chips = state.languages
        .map((l) => `<span class="rp-chip">${esc(l.name)}<span class="rp-lvl"> · ${esc(l.level)}</span></span>`)
        .join("");
    return secTag(h2("Languages") + `<div class="rp-chips">${chips}</div>`, "languages");
}

function headerBlock() {
    const contact = contactItems().join('<span class="rp-sep"> · </span>');
    return (
        `<div class="rp-head">` +
        photoHTML() +
        `<h1 class="rp-name">${esc(state.profile.fullName) || "Your Name"}</h1>` +
        `<div class="rp-title">${esc(state.profile.title) || "Professional Title"}</div>` +
        (contact ? `<div class="rp-contact">${contact}</div>` : "") +
        `</div>`
    );
}

function buildClassic() {
    const left = htmlSkills() + htmlLanguages() + htmlEducation();
    const right = htmlSummary() + htmlExperience() + htmlProjects() + htmlCertifications();
    return headerBlock() + `<div class="rp-body"><div class="rp-left">${left}</div><div class="rp-right">${right}</div></div>`;
}

function buildModern() {
    const side =
        photoHTML() +
        `<h1 class="rp-name">${esc(state.profile.fullName) || "Your Name"}</h1>` +
        `<div class="rp-title">${esc(state.profile.title) || "Professional Title"}</div>` +
        `<div class="rp-contact">${contactItems().map((c) => `<div class="rp-ci">${c}</div>`).join("")}</div>` +
        htmlSkills() +
        htmlLanguages();
    const main = htmlSummary() + htmlExperience() + htmlEducation() + htmlProjects() + htmlCertifications();
    return `<div class="rp-side">${side}</div><div class="rp-main">${main}</div>`;
}

function buildSingleColumn() {
    return (
        headerBlock() +
        `<div class="rp-body">` +
        htmlSummary() + htmlExperience() + htmlEducation() + htmlSkills() + htmlProjects() +
        htmlCertifications() + htmlLanguages() +
        `</div>`
    );
}

function renderPreview() {
    const page = $("resumePage");
    page.className = "resume-page tpl-" + state.settings.template;
    page.style.setProperty("--accent", state.settings.accent);
    page.style.fontSize = state.settings.fontSize + "px";
    page.dataset.spacing = state.settings.spacing;

    if (state.settings.template === "modern") page.innerHTML = buildModern();
    else if (state.settings.template === "minimal" || state.settings.template === "bold") page.innerHTML = buildSingleColumn();
    else page.innerHTML = buildClassic();
}

/* ---------- events ---------- */

function onEditorInput(e) {
    const el = e.target;
    const path = el.dataset.path;
    if (!path) return;
    setByPath(path, el.value);
    if (path === "settings.fontSize") $("fontSizeOut").textContent = el.value;
    const card = el.closest(".card");
    if (card) {
        const section = card.dataset.section;
        card.querySelector(".card-title").textContent = entryTitle(section, state[section][Number(card.dataset.index)], Number(card.dataset.index));
    }
    persist();
    schedulePreview();
}

function onEditorChange(e) {
    const el = e.target;
    const path = el.dataset.path;
    if (!path) return;
    setByPath(path, el.type === "checkbox" ? el.checked : el.value);
    persist();
    renderPreview();
}

function onEditorClick(e) {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) return addEntry(addBtn.dataset.add);

    const card = e.target.closest(".card");
    if (card) {
        const section = card.dataset.section;
        const i = Number(card.dataset.index);
        const btn = e.target.closest("[data-action]");
        if (btn) {
            if (btn.dataset.action === "remove") removeEntry(section, i);
            else if (btn.dataset.action === "up") moveEntry(section, i, -1);
            else if (btn.dataset.action === "down") moveEntry(section, i, 1);
            return;
        }
    }

    const chipX = e.target.closest("[data-skill-x]");
    if (chipX) {
        state.skills.splice(Number(chipX.dataset.skillX), 1);
        renderSkills();
        persist();
        schedulePreview();
    }
}

/* ---------- photo ---------- */

function readImage(file, cb) {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const max = 400;
            let { width: w, height: h } = img;
            if (w > max || h > max) {
                const scale = max / Math.max(w, h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            cb(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}

/* ---------- actions ---------- */

function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Exported resume.json");
}

function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            state = normalizeState(JSON.parse(reader.result));
            applyState();
            persist();
            toast("Resume imported");
        } catch (err) {
            toast("Invalid JSON file");
        }
    };
    reader.readAsText(file);
}

let toastTimer;
function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- nav ---------- */

function buildNav() {
    const nav = $("sectionNav");
    nav.innerHTML = "";
    NAV_ITEMS.forEach(([id, label]) => {
        const a = document.createElement("a");
        a.href = "#" + id;
        a.textContent = label;
        a.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
        });
        nav.appendChild(a);
    });
}

function initEvents() {
    const editor = $("editorSections");
    editor.addEventListener("input", onEditorInput);
    editor.addEventListener("change", onEditorChange);
    editor.addEventListener("click", onEditorClick);

    document.querySelectorAll(".ed-section-head").forEach((head) => {
        head.addEventListener("click", () => {
            const sec = head.parentElement;
            sec.classList.toggle("collapsed");
            head.querySelector(".ed-toggle").textContent = sec.classList.contains("collapsed") ? "+" : "−";
        });
    });

    const skillAdd = $("skillAdd");
    const skillName = $("skillName");
    skillAdd.addEventListener("click", () => {
        const name = skillName.value.trim();
        if (!name) return;
        state.skills.push({ name, level: Number($("skillLevel").value) });
        skillName.value = "";
        renderSkills();
        persist();
        schedulePreview();
    });
    skillName.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            skillAdd.click();
        }
    });

    $("btnPrint").addEventListener("click", () => window.print());
    $("btnExport").addEventListener("click", exportJSON);
    $("btnImport").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (f) importJSON(f);
        e.target.value = "";
    });
    $("btnReset").addEventListener("click", () => {
        if (confirm("Reset all data back to the default sample?")) {
            state = defaultState();
            applyState();
            persist();
            toast("Reset complete");
        }
    });

    $("photoInput").addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (!f) return;
        readImage(f, (dataUrl) => {
            state.profile.photo = dataUrl;
            persist();
            applyPhoto();
            schedulePreview();
        });
        e.target.value = "";
    });
    $("photoRemove").addEventListener("click", () => {
        state.profile.photo = "";
        persist();
        applyPhoto();
        schedulePreview();
    });
}

function init() {
    state = loadState();
    buildNav();
    initEvents();
    applyState();
}

init();
