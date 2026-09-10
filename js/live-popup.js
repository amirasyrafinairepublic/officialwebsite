/* ==========================================================================
   INAI REPUBLIC — TIKTOK LIVE FLOATING POPUP LOGIC
   Features: 2s trigger, 1-min duration, 9:16 draggable, sound toggle,
   TikTok Beg Kuning, floating hearts, chat stream & minimize mode
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("tiktok-live-popup");
  const miniBubble = document.getElementById("live-mini-bubble");
  const video = document.getElementById("live-video-player");
  const dragHeader = document.getElementById("live-drag-header");
  const countdownBar = document.getElementById("live-countdown-bar");
  const closeBtn = document.getElementById("live-close-btn");
  const minimizeBtn = document.getElementById("live-minimize-btn");
  const soundBtn = document.getElementById("live-sound-btn");
  const unmuteCallout = document.getElementById("live-unmute-callout");
  const followBtn = document.getElementById("live-follow-btn");
  const heartBtn = document.getElementById("live-heart-btn");
  const heartsCanvas = document.getElementById("live-hearts-canvas");
  const likesCounter = document.getElementById("live-likes-counter");
  const viewersCounter = document.getElementById("live-viewers-count-text");
  const chatStream = document.getElementById("live-chat-stream");
  const buyBtn = document.getElementById("live-buy-product-btn");

  if (!popup || !video) return;

  // --- Configuration ---
  const CONFIG = {
    triggerDelayMs: 2000,     // 2 seconds delay
    totalDurationSeconds: 60, // 1 minute active display
    baseLikes: 1420,
    baseViewers: 1580
  };

  let durationRemaining = CONFIG.totalDurationSeconds;
  let countdownTimer = null;
  let viewerInterval = null;
  let chatInterval = null;
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let hasMoved = false;
  let currentLikes = CONFIG.baseLikes;

  // Simulated Comments Pool
  const SIMULATED_COMMENTS = [
    { name: "Siti Nurhaliza", text: "Cantiknya warna Ruby Red ni sis! 😍" },
    { name: "Farah Diana", text: "Dah order 2 set untuk majlis kahwin ❤️" },
    { name: "Aina Mardhiah", text: "Betul ke sah wuduk? Berapa lama tahan?" },
    { name: "Inai Republic HQ", text: "Ya sayang, ada NPRA & KKM certified!" },
    { name: "Zulaikha", text: "Kuku nampak sihat dan berkilat sangat ✨" },
    { name: "Bella Astillah", text: "Warna pekat & tak bercapuk langsung!" },
    { name: "Nor Aini", text: "Beg Kuning no 1 tu dapat Nano Buffer free ke?" }
  ];
  let commentIndex = 0;

  /* ------------------------------------------------------------------------
     1. Initialization & 2-Second Trigger
     ------------------------------------------------------------------------ */
  setTimeout(() => {
    openPopup();
  }, CONFIG.triggerDelayMs);

  function openPopup() {
    popup.classList.add("is-visible");
    popup.classList.remove("is-closing");
    if (miniBubble) miniBubble.classList.add("hidden");

    // Start video playback (muted initially for browser autoplay compatibility)
    video.muted = true;
    video.play().catch(err => {
      console.log("Autoplay waiting for interaction:", err);
    });

    startCountdown();
    startViewerFluctuations();
    startChatStream();
  }

  /* ------------------------------------------------------------------------
     2. 1-Minute Countdown Timer
     ------------------------------------------------------------------------ */
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    durationRemaining = CONFIG.totalDurationSeconds;

    const intervalStepMs = 100;
    const totalSteps = (CONFIG.totalDurationSeconds * 1000) / intervalStepMs;
    let currentStep = 0;

    countdownTimer = setInterval(() => {
      currentStep++;
      const progressPercent = Math.max(0, 100 - (currentStep / totalSteps) * 100);
      if (countdownBar) {
        countdownBar.style.width = `${progressPercent}%`;
      }

      if (currentStep >= totalSteps) {
        clearInterval(countdownTimer);
        // Auto-minimize smoothly after 1 minute has elapsed
        minimizePopup();
      }
    }, intervalStepMs);
  }

  /* ------------------------------------------------------------------------
     3. Draggable Logic (Desktop Mouse & Mobile Touch)
     ------------------------------------------------------------------------ */
  function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function startDrag(e) {
    // Don't drag if clicking interactive buttons
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".live-action-btn") || e.target.closest("#live-unmute-callout")) {
      return;
    }

    isDragging = true;
    hasMoved = false;
    popup.classList.add("is-dragging");

    const coords = getEventCoords(e);
    startX = coords.x;
    startY = coords.y;

    const rect = popup.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Switch from right/bottom to left/top positioning smoothly
    popup.style.bottom = "auto";
    popup.style.right = "auto";
    popup.style.left = `${initialLeft}px`;
    popup.style.top = `${initialTop}px`;

    document.addEventListener("mousemove", onDragMove, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", onDragMove, { passive: false });
    document.addEventListener("touchend", endDrag);
  }

  function onDragMove(e) {
    if (!isDragging) return;

    const coords = getEventCoords(e);
    const deltaX = coords.x - startX;
    const deltaY = coords.y - startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMoved = true;
    }

    // Clamp coordinates within the viewport
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const minX = 8;
    const maxX = window.innerWidth - width - 8;
    const minY = 8;
    const maxY = window.innerHeight - height - 8;

    let targetX = initialLeft + deltaX;
    let targetY = initialTop + deltaY;

    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    popup.style.left = `${targetX}px`;
    popup.style.top = `${targetY}px`;

    e.preventDefault();
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    popup.classList.remove("is-dragging");

    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", onDragMove);
    document.removeEventListener("touchend", endDrag);
  }

  // Attach drag triggers to header and body
  if (dragHeader) {
    dragHeader.addEventListener("mousedown", startDrag);
    dragHeader.addEventListener("touchstart", startDrag, { passive: false });
  }
  // Allow dragging anywhere on the popup card as well
  popup.addEventListener("mousedown", (e) => {
    if (e.target === popup || e.target.classList.contains("live-video-element")) {
      startDrag(e);
    }
  });
  popup.addEventListener("touchstart", (e) => {
    if (e.target === popup || e.target.classList.contains("live-video-element")) {
      startDrag(e);
    }
  }, { passive: false });

  // Keep inside screen if window resizes
  window.addEventListener("resize", () => {
    if (!popup.classList.contains("is-visible")) return;
    const rect = popup.getBoundingClientRect();
    const maxX = window.innerWidth - popup.offsetWidth - 8;
    const maxY = window.innerHeight - popup.offsetHeight - 8;

    if (rect.left > maxX) popup.style.left = `${Math.max(8, maxX)}px`;
    if (rect.top > maxY) popup.style.top = `${Math.max(8, maxY)}px`;
  });

  /* ------------------------------------------------------------------------
     4. Audio & Sound Controls
     ------------------------------------------------------------------------ */
  function toggleAudio() {
    video.muted = !video.muted;
    updateAudioUI();
  }

  function updateAudioUI() {
    if (!soundBtn) return;
    if (video.muted) {
      soundBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      soundBtn.setAttribute("aria-label", "Buka Suara");
      if (unmuteCallout) unmuteCallout.classList.remove("hidden");
    } else {
      soundBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      `;
      soundBtn.setAttribute("aria-label", "Bisukan Suara");
      if (unmuteCallout) unmuteCallout.classList.add("hidden");
    }
  }

  if (soundBtn) soundBtn.addEventListener("click", toggleAudio);
  if (unmuteCallout) unmuteCallout.addEventListener("click", toggleAudio);

  /* ------------------------------------------------------------------------
     5. Close & Minimize Actions
     ------------------------------------------------------------------------ */
  function closePopup() {
    popup.classList.remove("is-visible");
    popup.classList.add("is-closing");
    video.pause();
    if (countdownTimer) clearInterval(countdownTimer);
    if (viewerInterval) clearInterval(viewerInterval);
    if (chatInterval) clearInterval(chatInterval);

    // After closing, provide a subtle minimized bubble so user can re-engage
    setTimeout(() => {
      if (miniBubble) miniBubble.classList.remove("hidden");
    }, 400);
  }

  function minimizePopup() {
    popup.classList.remove("is-visible");
    popup.classList.add("is-closing");
    if (miniBubble) miniBubble.classList.remove("hidden");
  }

  function restorePopup() {
    if (miniBubble) miniBubble.classList.add("hidden");
    openPopup();
  }

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (minimizeBtn) minimizeBtn.addEventListener("click", minimizePopup);
  if (miniBubble) miniBubble.addEventListener("click", restorePopup);

  /* ------------------------------------------------------------------------
     6. Follow Button Effect
     ------------------------------------------------------------------------ */
  if (followBtn) {
    followBtn.addEventListener("click", () => {
      const isFollowing = followBtn.classList.contains("is-following");
      if (!isFollowing) {
        followBtn.classList.add("is-following");
        followBtn.textContent = "Mengikuti";
        spawnHeart();
      } else {
        followBtn.classList.remove("is-following");
        followBtn.innerHTML = `+ Ikuti`;
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. Floating Hearts & Like Mechanics (TikTok Style)
     ------------------------------------------------------------------------ */
  const HEART_ICONS = ["❤️", "💖", "💕", "✨", "🔥", "💅", "💎"];

  function spawnHeart() {
    if (!heartsCanvas) return;

    currentLikes++;
    if (likesCounter) {
      likesCounter.textContent = (currentLikes / 1000).toFixed(1) + "k";
    }

    const heart = document.createElement("div");
    heart.className = "live-heart-particle";
    heart.textContent = HEART_ICONS[Math.floor(Math.random() * HEART_ICONS.length)];

    // Randomize trajectory drift
    const drift = (Math.random() * 36 - 18) + "px";
    const driftEnd = (Math.random() * 50 - 25) + "px";
    const rot = (Math.random() * 40 - 20) + "deg";
    const rotEnd = (Math.random() * 60 - 30) + "deg";

    heart.style.setProperty("--drift", drift);
    heart.style.setProperty("--drift-end", driftEnd);
    heart.style.setProperty("--rot", rot);
    heart.style.setProperty("--rot-end", rotEnd);

    heartsCanvas.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 2000);
  }

  if (heartBtn) {
    heartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      spawnHeart();
      spawnHeart();
    });
  }

  // Double tap video to like
  let lastTap = 0;
  popup.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a") || hasMoved) return;
    const now = Date.now();
    if (now - lastTap < 300) {
      spawnHeart();
      spawnHeart();
      spawnHeart();
    }
    lastTap = now;
  });

  /* ------------------------------------------------------------------------
     8. Simulated Viewer Fluctuations & Chat Stream
     ------------------------------------------------------------------------ */
  function startViewerFluctuations() {
    if (viewerInterval) clearInterval(viewerInterval);
    let viewers = CONFIG.baseViewers;

    viewerInterval = setInterval(() => {
      const delta = Math.floor(Math.random() * 21) - 10;
      viewers = Math.max(1200, viewers + delta);
      if (viewersCounter) {
        viewersCounter.textContent = (viewers / 1000).toFixed(1) + "k";
      }
    }, 3500);
  }

  function startChatStream() {
    if (chatInterval) clearInterval(chatInterval);

    chatInterval = setInterval(() => {
      if (!chatStream) return;
      const comment = SIMULATED_COMMENTS[commentIndex % SIMULATED_COMMENTS.length];
      commentIndex++;

      const bubble = document.createElement("div");
      bubble.className = "live-chat-bubble";
      bubble.innerHTML = `<span class="live-chat-author">${comment.name}:</span><span class="live-chat-text">${comment.text}</span>`;

      chatStream.appendChild(bubble);

      // Keep maximum 2-3 bubbles visible
      while (chatStream.children.length > 2) {
        chatStream.removeChild(chatStream.firstChild);
      }
    }, 4500);
  }

  /* ------------------------------------------------------------------------
     9. TikTok Beg Kuning (Yellow Cart Showcase) Buy Action
     ------------------------------------------------------------------------ */
  if (buyBtn) {
    buyBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Trigger cart drawer or add item
      const cartToggleBtn = document.getElementById("cart-toggle-btn");
      const rubyAddBtn = document.querySelector('[data-product-id="ruby-red"]');

      if (rubyAddBtn) {
        rubyAddBtn.click();
      } else if (cartToggleBtn) {
        cartToggleBtn.click();
      } else {
        window.location.hash = "katalog";
      }

      // Visual feedback on Beg Kuning
      buyBtn.textContent = "✓ Ditambah";
      buyBtn.style.background = "#22c55e";
      spawnHeart();

      setTimeout(() => {
        buyBtn.textContent = "BELI";
        buyBtn.style.background = "";
      }, 2500);
    });
  }
});
