/* App controller: form wiring, dynamic entries, localStorage, live preview */
(function (global) {
  "use strict";

  var Data = global.Data;
  var Render = global.Render;

  var model = loadModel();

  var els = {
    form: document.getElementById("resumeForm"),
    container: document.getElementById("resumeContainer"),
    templateSelect: document.getElementById("templateSelect"),
    accentColor: document.getElementById("accentColor"),
    previewMode: document.getElementById("previewMode"),
    eduList: document.getElementById("educationList"),
    expList: document.getElementById("experienceList"),
    skillsList: document.getElementById("skillsList"),
    projectList: document.getElementById("projectsList")
  };

  /* ---------- Persistence ---------- */

  function loadModel() {
    try {
      var raw = localStorage.getItem(Data.STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.personal) return parsed;
      }
    } catch (e) { /* ignore corrupt storage */ }
    return Data.DEFAULT_RESUME;
  }

  function saveModel() {
    try {
      localStorage.setItem(Data.STORAGE_KEY, JSON.stringify(model));
    } catch (e) { /* storage full / unavailable */ }
  }

  /* ---------- Editor list rendering ---------- */

  function cardWrap(inner) {
    return '<div class="card">' + inner + "</div>";
  }

  function cardHead(label) {
    return (
      '<div class="card-head">' +
        "<strong>" + label + "</strong>" +
        '<button type="button" class="remove-btn" data-remove="1">Remove</button>' +
      "</div>"
    );
  }

  function fieldRow(idPart, label, value, cls) {
    var clsAttr = cls ? ' class="' + cls + '"' : "";
    return (
      '<div class="field">' +
        '<label for="' + idPart + '">' + label + "</label>" +
        '<input type="text" id="' + idPart + '"' + clsAttr + ' value="' + safeAttr(value) + '">' +
      "</div>"
    );
  }

  function safeAttr(val) {
    var div = document.createElement("div");
    div.textContent = val == null ? "" : String(val);
    return div.innerHTML.replace(/"/g, "&quot;");
  }

  function renderEducation() {
    var ids = ["school", "degree", "dates", "details"];
    els.eduList.innerHTML = model.education.map(function (edu, idx) {
      var rows = "";
      rows += fieldRow("edu-school-" + idx, "School / University", edu.school);
      rows += fieldRow("edu-degree-" + idx, "Degree", edu.degree);
      rows += fieldRow("edu-dates-" + idx, "Dates", edu.dates);
      rows += fieldRow("edu-details-" + idx, "Details / GPA", edu.details);
      return cardWrap(cardHead("Education Entry") + rows);
    }).join("");
  }

  function renderExperience() {
    els.expList.innerHTML = model.experience.map(function (exp, idx) {
      var bullets = (exp.bullets || []).join("\n");
      var rows = "";
      rows += fieldRow("exp-company-" + idx, "Company / Organization", exp.company, "exp-company");
      rows += fieldRow("exp-role-" + idx, "Job Title", exp.role, "exp-role");
      rows += fieldRow("exp-dates-" + idx, "Dates", exp.dates, "exp-dates");
      rows +=
        '<div class="field">' +
          '<label for="exp-summary-' + idx + '">Summary</label>' +
          '<textarea id="exp-summary-' + idx + '" class="exp-summary" rows="2">' + safeAttr(exp.jobSummary) + "</textarea>" +
        "</div>" +
        '<div class="field">' +
          '<label for="exp-bullets-' + idx + '">Achievements (one per line)</label>' +
          '<textarea id="exp-bullets-' + idx + '" class="exp-bullets" rows="4">' + safeAttr(bullets) + "</textarea>" +
        "</div>";
      return cardWrap(cardHead("Experience Entry") + rows);
    }).join("");
  }

  function renderSkills() {
    els.skillsList.innerHTML = model.skills.map(function (grp, idx) {
      var items = (grp.items || []).join(", ");
      var rows =
        fieldRow("skill-group-" + idx, "Category (e.g. Languages)", grp.group, "skill-group") +
        '<div class="field">' +
          '<label for="skill-items-' + idx + '">Skills (comma separated)</label>' +
          '<input type="text" id="skill-items-' + idx + '" class="skill-items" value="' + safeAttr(items) + '">' +
        "</div>";
      return cardWrap(cardHead("Skill Group") + rows);
    }).join("");
  }

  function renderProjects() {
    els.projectList.innerHTML = model.projects.map(function (prj, idx) {
      var rows = "";
      rows += fieldRow("prj-name-" + idx, "Project Name", prj.name, "prj-name");
      rows += fieldRow("prj-dates-" + idx, "Dates", prj.dates, "prj-dates");
      rows += fieldRow("prj-link-" + idx, "Link", prj.link, "prj-link");
      rows +=
        '<div class="field">' +
          '<label for="prj-desc-' + idx + '">Description</label>' +
          '<textarea id="prj-desc-' + idx + '" class="prj-desc" rows="3">' + safeAttr(prj.description) + "</textarea>" +
        "</div>";
      return cardWrap(cardHead("Project Entry") + rows);
    }).join("");
  }

  var renderers = {
    education: renderEducation,
    experience: renderExperience,
    skills: renderSkills,
    projects: renderProjects
  };

  /* ---------- Reading values back into the model ---------- */

  function collectData() {
    model.personal = {
      fullName: val("fullName"),
      jobTitle: val("jobTitle"),
      email: val("email"),
      phone: val("phone"),
      location: val("location"),
      website: val("website"),
      summary: val("summary")
    };

    model.education = [];
    els.eduList.querySelectorAll(".card").forEach(function (card) {
      var values = {};
      card.querySelectorAll("input").forEach(function (input) {
        values[input.dataset.key || input.id.split("-")[1]] = input.value;
      });
      model.education.push({
        school: toStr(values.school),
        degree: toStr(values.degree),
        dates: toStr(values.dates),
        details: toStr(values.details)
      });
    });

    model.experience = [];
    els.expList.querySelectorAll(".card").forEach(function (card) {
      var get = function (cls) {
        var el = card.querySelector("." + cls);
        return el ? el.value.trim() : "";
      };
      model.experience.push({
        company: get("exp-company"),
        role: get("exp-role"),
        dates: get("exp-dates"),
        jobSummary: get("exp-summary"),
        bullets: listLines(get("exp-bullets"))
      });
    });

    model.skills = [];
    els.skillsList.querySelectorAll(".card").forEach(function (card) {
      var get = function (cls) {
        var el = card.querySelector("." + cls);
        return el ? el.value.trim() : "";
      };
      var raw = get("skill-items").split(",");
      model.skills.push({
        group: get("skill-group"),
        items: raw.map(trimItem).filter(Boolean)
      });
    });

    model.projects = [];
    els.projectList.querySelectorAll(".card").forEach(function (card) {
      var get = function (cls) {
        var el = card.querySelector("." + cls);
        return el ? el.value.trim() : "";
      };
      model.projects.push({
        name: get("prj-name"),
        dates: get("prj-dates"),
        link: get("prj-link"),
        description: get("prj-desc")
      });
    });

    model.template = els.templateSelect.value;
    model.accent = els.accentColor.value;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function toStr(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function trimItem(s) { return s.trim(); }

  function listLines(text) {
    return text.split("\n").map(trimItem).filter(Boolean);
  }

  /* ---------- Preview ---------- */

  function renderPreview() {
    if (els.previewMode.value === "text") {
      var txt = Render.text(model);
      els.container.innerHTML = '<pre class="plain-text-output">' + safeAttr(txt) + "</pre>";
    } else {
      els.container.innerHTML = Render.html(model, model.template);
    }
    els.container.classList.toggle("is-text", els.previewMode.value === "text");
    els.container.dataset.template = model.template;
    els.container.style.setProperty("--accent", model.accent || "#2563eb");
  }

  /* ---------- Events ---------- */

  function handleFormInput() {
    collectData();
    renderPreview();
    saveModel();
  }

  els.form.addEventListener("input", handleFormInput);
  els.form.addEventListener("change", handleFormInput);

  els.form.addEventListener("click", function (e) {
    var removeBtn = e.target.closest("[data-remove]");
    var addBtn = e.target.closest(".btn-add");
    var panelHeader = e.target.closest(".panel-header");

    if (panelHeader) {
      panelHeader.setAttribute("aria-expanded", panelHeader.getAttribute("aria-expanded") === "true" ? "false" : "true");
      return;
    }

    if (addBtn) {
      var type = addBtn.id.replace("add", "").toLowerCase();
      addEntry(type);
      return;
    }

    if (removeBtn) {
      var card = removeBtn.closest(".card");
      if (!card) return;
      var index = Array.prototype.indexOf.call(card.parentElement.children, card);
      var parentId = card.parentElement.id;
      if (parentId === "educationList") model.education.splice(index, 1);
      else if (parentId === "experienceList") model.experience.splice(index, 1);
      else if (parentId === "skillsList") model.skills.splice(index, 1);
      else if (parentId === "projectsList") model.projects.splice(index, 1);
      renderAllLists();
      renderPreview();
      saveModel();
    }
  });

  function addEntry(type) {
    if (type === "education") model.education.push({ school: "", degree: "", dates: "", details: "" });
    if (type === "experience") model.experience.push({ company: "", role: "", dates: "", jobSummary: "", bullets: [] });
    if (type === "skill") model.skills.push({ group: "", items: [] });
    if (type === "project") model.projects.push({ name: "", dates: "", link: "", description: "" });
    var renderer = renderers[type] || renderers[type + "s"];
    if (renderer) renderer();
    renderPreview();
    saveModel();
  }

  els.templateSelect.addEventListener("change", function () {
    model.template = els.templateSelect.value;
    renderPreview();
    saveModel();
  });

  els.accentColor.addEventListener("input", function () {
    model.accent = els.accentColor.value;
    renderPreview();
  });

  els.accentColor.addEventListener("change", saveModel);

  els.previewMode.addEventListener("change", renderPreview);

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!window.confirm("Reset all resume data to the defaults? This cannot be undone.")) return;
    model = Data.emptyResume();
    populateEditor();
    renderPreview();
    saveModel();
  });

  /* ---------- Initialization ---------- */

  function renderAllLists() {
    Object.keys(renderers).forEach(function (key) { renderers[key](); });
  }

  function populateEditor() {
    var p = model.personal;
    var set = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.value = value || "";
    };
    set("fullName", p.fullName);
    set("jobTitle", p.jobTitle);
    set("email", p.email);
    set("phone", p.phone);
    set("location", p.location);
    set("website", p.website);
    set("summary", p.summary);

    els.templateSelect.value = model.template || "modern";
    els.accentColor.value = model.accent || "#2563eb";

    renderAllLists();
    renderPreview();
  }

  global.App = {
    init: populateEditor,
    getModel: function () { return model; },
    renderPreview: renderPreview
  };

  populateEditor();
})(window);