/* ==========================================================================
   INAI REPUBLIC — CERTIFICATE IMAGE MODAL
   Lightweight accessible modal for the consolidated certificate page.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("certificate-modal");
    if (!modal) return;

    var dialog = modal.querySelector(".certificate-modal-dialog");
    var image = document.getElementById("certificate-modal-image");
    var closeButton = document.getElementById("certificate-modal-close");
    var opener = null;

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove("certificate-modal-open");
      if (opener && typeof opener.focus === "function") opener.focus();
    }

    function open(button) {
      var source = button.querySelector("img");
      if (!source) return;
      opener = button;
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      modal.hidden = false;
      document.body.classList.add("certificate-modal-open");
      closeButton.focus();
    }

    document.querySelectorAll(".certificate-image-button").forEach(function (button) {
      button.addEventListener("click", function () { open(button); });
    });

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.classList.contains("certificate-modal-backdrop")) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || modal.hidden) return;
      var focusable = dialog.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });
})();