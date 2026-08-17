/* Renders the resume model into HTML (preview) or plain text (ATS view) */
(function (global) {
  "use strict";

  function esc(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function hrefOf(url) {
    url = (url || "").trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return "https://" + url;
  }

  var CONTACT_ORDER = ["email", "phone", "location", "website"];

  function personalContact(p) {
    return CONTACT_ORDER.map(function (key) {
      var val = (p[key] || "").trim();
      if (!val) return null;
      if (key === "email") {
        return '<li><a href="mailto:' + esc(val) + '">' + esc(val) + "</a></li>";
      }
      if (key === "website") {
        return '<li><a href="' + esc(hrefOf(val)) + '">' + esc(val) + "</a></li>";
      }
      return "<li>" + esc(val) + "</li>";
    }).filter(Boolean).join("");
  }

  function renderEducation(items) {
    return items.map(function (e) {
      var sub = e.school ? '<p class="r-sub">' + esc(e.school) + "</p>" : "";
      var detail = e.details ? '<p class="r-detail">' + esc(e.details) + "</p>" : "";
      return (
        '<div class="r-entry">' +
          '<div class="r-entry-head">' +
            "<h3>" + esc(e.degree) + "</h3>" +
            (e.dates ? '<span class="r-date">' + esc(e.dates) + "</span>" : "") +
          "</div>" +
          sub +
          detail +
        "</div>"
      );
    }).join("");
  }

  function renderExperience(items) {
    return items.map(function (x) {
      var head =
        '<div class="r-entry-head">' +
          "<h3>" + esc(x.role) + " - " + esc(x.company) + "</h3>" +
          (x.dates ? '<span class="r-date">' + esc(x.dates) + "</span>" : "") +
        "</div>";
      var body = "";
      if (x.jobSummary) body += '<p class="r-detail">' + esc(x.jobSummary) + "</p>";
      if (x.bullets && x.bullets.length) {
        body += "<ul class=\"r-bullets\">" +
          x.bullets.filter(Boolean).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") +
          "</ul>";
      }
      return '<div class="r-entry">' + head + body + "</div>";
    }).join("");
  }

  function renderProjects(items) {
    return items.map(function (pr) {
      var head =
        '<div class="r-entry-head">' +
          "<h3>" + esc(pr.name) + "</h3>" +
          (pr.dates ? '<span class="r-date">' + esc(pr.dates) + "</span>" : "") +
        "</div>";
      var meta = "";
      if (pr.link) meta += '<p class="r-sub">' + esc(pr.link) + "</p>";
      var desc = pr.description ? '<p class="r-detail">' + esc(pr.description) + "</p>" : "";
      return '<div class="r-entry">' + head + meta + desc + "</div>";
    }).join("");
  }

  function renderSkills(groups) {
    return groups.map(function (g) {
      var name = g.group ? '<h3>' + esc(g.group) + "</h3>" : "";
      return (
        '<div class="r-skills-group">' +
          name +
          '<p class="r-skills-line">' + esc(g.items && g.items.join(", ")) + "</p>" +
        "</div>"
      );
    }).join("");
  }

  function sectionBlock(title, body) {
    if (!body) return "";
    return (
      '<section class="r-section">' +
        '<h2 class="r-section-title">' + esc(title) + "</h2>" +
        body +
      "</section>"
    );
  }

  /* ---------- HTML render ---------- */

  function renderHTML(data, template) {
    var p = data.personal;
    var header =
      '<header class="resume-header">' +
        '<h1 class="r-name">' + esc(p.fullName) + "</h1>" +
        (p.jobTitle ? '<p class="r-title">' + esc(p.jobTitle) + "</p>" : "") +
        personalContact(p) +
        (p.summary ? '<p class="r-summary">' + esc(p.summary) + "</p>" : "") +
      "</header>";

    var body =
      sectionBlock("Education", renderEducation(data.education)) +
      sectionBlock("Experience", renderExperience(data.experience)) +
      sectionBlock("Projects", renderProjects(data.projects)) +
      sectionBlock("Skills", renderSkills(data.skills));

    return (
      '<article class="resume resume--' + template + '">' +
        header +
        body +
      "</article>"
    );
  }

  /* ---------- Plain text render (ATS upload) ---------- */

  function txtBullet(text) {
    return text.replace(/^/gm, "  - ");
  }

  function txtBlock(text) {
    if (!text) return "";
    var parsed = new DOMParser().parseFromString(text, "text/html");
    return (parsed.body.textContent || "").trim();
  }

  function txtSection(title, body) {
    if (!body) return "";
    return "\n" + title.toUpperCase() + "\n" + "----------------------\n" + body + "\n";
  }

  function renderText(data) {
    var p = data.personal;
    var contact = [];

    ["email", "phone", "location", "website"].forEach(function (key) {
      var val = (p[key] || "").trim();
      if (val) contact.push(val);
    });

    var header =
      (p.fullName || "") + "\n" +
      (p.jobTitle ? p.jobTitle + "\n" : "") +
      (contact.length ? contact.join(" | ") + "\n" : "") +
      (p.summary ? "\n" + p.summary + "\n" : "");

    var edu = data.education.map(function (e) {
      return [e.degree, e.school, e.dates, e.details].filter(Boolean).join(" | ");
    }).join("\n");

    var exp = data.experience.map(function (x) {
      var head = [x.role, x.company, x.dates].filter(Boolean).join(" | ");
      var parts = [head];
      if (x.jobSummary) parts.push(x.jobSummary);
      if (x.bullets && x.bullets.length) parts.push(txtBullet(x.bullets.filter(Boolean).join("\n")));
      return parts.join("\n");
    }).join("\n\n");

    var projects = data.projects.map(function (pr) {
      return [pr.name, pr.dates, pr.link, pr.description].filter(Boolean).join(" | ");
    }).join("\n");

    var skills = data.skills.map(function (g) {
      var line = (g.items && g.items.join(", ")) || "";
      return g.group ? g.group + ": " + line : line;
    }).filter(Boolean).join("\n");

    var full =
      header +
      txtSection("Education", edu) +
      txtSection("Experience", exp) +
      txtSection("Projects", projects) +
      txtSection("Skills", skills);

    return txtBlock(full) + "\n";
  }

  global.Render = {
    html: renderHTML,
    text: renderText
  };
})(window);