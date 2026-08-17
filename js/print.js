/* Print / PDF export and plain-text download */
(function (global) {
  "use strict";

  var App = global.App;
  var Render = global.Render;

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function safeFilename(name) {
    var base = (name || "resume").trim().replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").toLowerCase();
    return base || "resume";
  }

  document.getElementById("downloadPdf").addEventListener("click", function () {
    window.print();
  });

  document.getElementById("downloadTxt").addEventListener("click", function () {
    var model = App.getModel();
    var filename = safeFilename(model.personal.fullName) + "-resume.txt";
    download(filename, Render.text(model), "text/plain;charset=utf-8");
  });

  /* Expose for potential programmatic use (e.g., a self-serve PDF via html2pdf later). */
  global.Print = { download: download, safeFilename: safeFilename };
})(window);