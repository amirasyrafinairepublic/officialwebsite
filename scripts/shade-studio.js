/* ==========================================================================
   INAI REPUBLIC SHADE STUDIO — Live Camera Hair Colour Simulation
   scripts/shade-studio.js  (ES module)

   • Semua pemprosesan berlaku dalam pelayar (on-device).
   • TIADA gambar dihantar ke mana-mana server.
   • Model segmentasi rambut (16 MB) dimuatkan secara "lazy" — hanya apabila
     pengguna menekan "MULA KAMERA" atau "MUAT NAIK GAMBAR".

   Teknik: MediaPipe Tasks Vision v1.0.1 (ESM) + selfie_multiclass_256x256.
   Label kategori mask: 0 latar · 1 RAMBUT · 2 kulit badan · 3 kulit muka ·
   4 pakaian · 5 lain-lain. Hanya indeks 1 (rambut) digunakan.
   ========================================================================== */

const VISION_BUNDLE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/vision_bundle.mjs";
const VISION_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

const HAIR_CLASS_INDEX = 1;   // 1 = rambut dalam mask selfie_multiclass
const MASK_FALLBACK_SIZE = 256;

const SEGMENT_INTERVAL_NORMAL = 70;    // ms — maksimum sekali setiap 70ms
const SEGMENT_INTERVAL_LOW_PERF = 140; // ms — mod prestasi rendah
const LOW_FPS_THRESHOLD = 12;
const LOW_FPS_GRACE_MS = 4000;

const CAPTURE_WIDTH_IDEAL = 640;
const CAPTURE_HEIGHT_IDEAL = 480;
const LOW_PERF_WIDTH_IDEAL = 480;
const LOW_PERF_HEIGHT_IDEAL = 360;

const IMAGE_MAX_SIZE = 640;      // saiz maksimum sisi gambar yang dimuat naik

const FEATHER_BLUR = "blur(3px)";
const SOFT_LIGHT_ALPHA = 0.2;

/* --------------------------------------------------------------------------
   Data 12 tona rasmi — hex diukur dari gambar produk sebenar.
   Susunan: gelap → cerah, shade fesyen di belakang.
   -------------------------------------------------------------------------- */
const SHADES = [
  { id: "coco-black", name: "Coco Black", img: "assets/shades/coco-black.webp",
    hex: "#222222", shadow: "#161616", highlight: "#353535",
    blend: "multiply", strength: 0.70, lift: 0.00, uban: true, ubanNote: "Nampak natural" },
  { id: "chocolate-brown", name: "Chocolate Brown", img: "assets/shades/chocolate-brown.webp",
    hex: "#271F1F", shadow: "#161616", highlight: "#3D2D2C",
    blend: "color", strength: 0.85, lift: 0.00, uban: true, ubanNote: "Nampak soft" },
  { id: "royal-chestnut", name: "Royal Chestnut", img: "assets/shades/royal-chestnut.webp",
    hex: "#402C28", shadow: "#241816", highlight: "#5E443F",
    blend: "color", strength: 0.80, lift: 0.00, uban: false, ubanNote: "" },
  { id: "ash-brown", name: "Ash Brown", img: "assets/shades/ash-brown.webp",
    hex: "#42332B", shadow: "#2B2119", highlight: "#5C4A42",
    blend: "color", strength: 0.75, lift: 0.00, uban: false, ubanNote: "" },
  { id: "mocha-milk-tea", name: "Mocha Milk Tea", img: "assets/shades/mocha-milk-tea.webp",
    hex: "#442F25", shadow: "#271A16", highlight: "#63473B",
    blend: "color", strength: 0.75, lift: 0.00, uban: false, ubanNote: "" },
  { id: "hazelnut", name: "Hazelnut", img: "assets/shades/hazelnut.webp",
    hex: "#6F4B2F", shadow: "#402B19", highlight: "#9C6E48",
    blend: "color", strength: 0.55, lift: 0.30, uban: false, ubanNote: "" },
  { id: "honey-brown", name: "Honey Brown", img: "assets/shades/honey-brown.webp",
    hex: "#693F26", shadow: "#3D2416", highlight: "#945D3C",
    blend: "color", strength: 0.75, lift: 0.00, uban: false, ubanNote: "" },
  { id: "caramel-gold", name: "Caramel Gold", img: "assets/shades/caramel-gold.webp",
    hex: "#7E572A", shadow: "#493217", highlight: "#AF7E42",
    blend: "color", strength: 0.55, lift: 0.35, uban: false, ubanNote: "" },
  { id: "ash-grey", name: "Ash Grey", img: "assets/shades/ash-grey.webp",
    hex: "#646463", shadow: "#474747", highlight: "#828280",
    blend: "saturation", strength: 0.85, lift: 0.10, uban: false, ubanNote: "" },
  { id: "persian-red", name: "Persian Red", img: "assets/shades/persian-red.webp",
    hex: "#482023", shadow: "#291616", highlight: "#683138",
    blend: "color", strength: 0.80, lift: 0.00, uban: false, ubanNote: "" },
  { id: "burgundy", name: "Burgundy", img: "assets/shades/burgundy.webp",
    hex: "#332031", shadow: "#1D161B", highlight: "#4C3149",
    blend: "color", strength: 0.85, lift: 0.00, uban: false, ubanNote: "" },
  { id: "olive-jade", name: "Olive Jade", img: "assets/shades/olive-jade.webp",
    hex: "#303428", shadow: "#1B1D17", highlight: "#494E3F",
    blend: "color", strength: 0.85, lift: 0.00, uban: false, ubanNote: "" }
];

/* --------------------------------------------------------------------------
   Utiliti kecil
   -------------------------------------------------------------------------- */
function hexToRgb(hex) {
  const h = String(hex).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function $(id) { return document.getElementById(id); }

/* --------------------------------------------------------------------------
   Keadaan
   -------------------------------------------------------------------------- */
const el = {
  stage: $("studio-stage"),
  video: $("studio-video"),
  canvas: $("studio-canvas"),
  placeholder: $("studio-placeholder"),
  status: $("studio-status"),
  startBtn: $("studio-start-btn"),
  uploadBtn: $("studio-upload-btn"),
  fileInput: $("studio-file-input"),
  captureBtn: $("studio-capture-btn"),
  switchBtn: $("studio-switch-btn"),
  strength: $("studio-strength"),
  strengthValue: $("studio-strength-value"),
  perfNote: $("studio-perf-note"),
  addBtn: $("studio-add-btn"),
  shadeName: $("studio-shade-name"),
  shadeDesc: $("studio-shade-desc"),
  shadeButtons: Array.prototype.slice.call(document.querySelectorAll(".shade-card"))
};

// Section Shade Studio tidak ada pada halaman ini — jangan jalankan apa-apa.
if (el.canvas && el.shadeButtons.length) bootstrap();

function bootstrap() {
  const ctx = el.canvas.getContext("2d", { willReadFrequently: false });

  /* Canvas kerja */
  const overlay256 = document.createElement("canvas");
  overlay256.width = MASK_FALLBACK_SIZE;
  overlay256.height = MASK_FALLBACK_SIZE;
  const overlayCtx = overlay256.getContext("2d");

  /* Kanvas untuk menurunkan resolusi sumber ke grid mask (256×256) */
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = MASK_FALLBACK_SIZE;
  maskCanvas.height = MASK_FALLBACK_SIZE;
  const maskCtx = maskCanvas.getContext("2d");

  /* Kanvas gambar yang dimuat naik — dipotong "cover" ke segi empat sama supaya
     grid mask 256×256 selari dengan paparan (tiada offset). */
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = IMAGE_MAX_SIZE;
  imageCanvas.height = IMAGE_MAX_SIZE;
  const imageCtx = imageCanvas.getContext("2d", { willReadFrequently: true });

  const uploadImage = new Image();
  uploadImage.decoding = "async";

  const state = {
    mode: "idle",            // idle | video | image
    segmenter: null,
    runningMode: null,       // "VIDEO" | "IMAGE"
    loading: false,
    cameraOn: false,
    facingMode: "user",
    deviceCount: 0,
    stream: null,
    rafId: null,
    segmentInterval: SEGMENT_INTERVAL_NORMAL,
    lastSegmentTs: -Infinity,
    lastVideoTime: -1,
    hasMask: false,
    lowPerf: false,
    startedAt: 0,
    cameraStartedAt: 0,
    frameCount: 0,
    fps: 0,
    shadeIndex: 9,           // Persian Red (lalai)
    strength: 0.80,
    modelReady: false,
    modelUnavailable: false,
    imageCache: null,        // { mask, source, w, h } untuk mod gambar
    statusTimer: null
  };

  /* ------------------------------------------------------------------------
     Status mesej
     ------------------------------------------------------------------------ */
  function setStatus(message, showSpinner) {
    if (!el.status) return;
    if (!message) {
      el.status.hidden = true;
      el.status.innerHTML = "";
      return;
    }
    el.status.hidden = false;
    el.status.innerHTML = showSpinner
      ? '<span class="studio-spinner" aria-hidden="true"></span><span>' + message + "</span>"
      : "<span>" + message + "</span>";
  }

  function setPerfNote(message) {
    if (!el.perfNote) return;
    if (!message) { el.perfNote.hidden = true; el.perfNote.textContent = ""; return; }
    el.perfNote.hidden = false;
    el.perfNote.textContent = message;
  }

  function setPlaceholderVisible(visible) {
    if (el.placeholder) el.placeholder.hidden = !visible;
  }

  function currentShade() { return SHADES[state.shadeIndex]; }

/* ------------------------------------------------------------------------
     Pemuat model — LAZY. Hanya dipanggil bila pengguna klik butang.
     ------------------------------------------------------------------------ */
  let visionInstance = null;
  let FilesetResolverRef = null;
  let ImageSegmenterRef = null;

  async function loadVision() {
    if (visionInstance) return visionInstance;
    const mod = await import(/* @vite-ignore */ VISION_BUNDLE_URL);
    FilesetResolverRef = mod.FilesetResolver;
    ImageSegmenterRef = mod.ImageSegmenter;
    visionInstance = await FilesetResolverRef.forVisionTasks(VISION_WASM_URL);
    return visionInstance;
  }

  async function loadSegmenter(mode) {
    if (state.segmenter) {
      if (state.runningMode !== mode) {
        await state.segmenter.setOptions({ runningMode: mode });
        state.runningMode = mode;
      }
      return state.segmenter;
    }

    setStatus("Memuatkan model...", true);
    const vision = await loadVision();
    const build = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL_URL, delegate: delegate },
      runningMode: mode,
      outputCategoryMask: true
    });

    let segmenter;
    try {
      segmenter = await ImageSegmenterRef.createFromOptions(vision, build("GPU"));
    } catch (gpuErr) {
      console.warn("[ShadeStudio] GPU delegate gagal — ulang dengan CPU.", gpuErr);
      segmenter = await ImageSegmenterRef.createFromOptions(vision, build("CPU"));
    }

    state.segmenter = segmenter;
    state.runningMode = mode;
    return segmenter;
  }

  /* ------------------------------------------------------------------------
     Mask → overlay 256×256 (piksel rambut sahaja, selebihnya alpha 0)
     Gradient 3 ton: `shadow` untuk bahagian gelap rambut, `highlight` untuk
     bahagian cerah — supaya rambut nampak berdimensi, bukan rata.
     ------------------------------------------------------------------------ */
  function buildOverlay(maskU8, sourceRGBA, maskW, maskH, shade) {
    if (overlay256.width !== maskW || overlay256.height !== maskH) {
      overlay256.width = maskW;
      overlay256.height = maskH;
    }

    const imageData = overlayCtx.createImageData(maskW, maskH);
    const out = imageData.data;
    const dark = hexToRgb(shade.shadow);
    const light = hexToRgb(shade.highlight);

    for (let i = 0, p = 0; i < maskU8.length; i++, p += 4) {
      if (maskU8[i] !== HAIR_CLASS_INDEX) continue; // 0 latar · 2 kulit · 3 muka · 4 pakaian · 5 lain

      const j = p;
      const luma = 0.299 * sourceRGBA[j] + 0.587 * sourceRGBA[j + 1] + 0.114 * sourceRGBA[j + 2];
      const t = clamp01((luma - 30) / 190);

      out[p] = Math.round(dark.r + (light.r - dark.r) * t);
      out[p + 1] = Math.round(dark.g + (light.g - dark.g) * t);
      out[p + 2] = Math.round(dark.b + (light.b - dark.b) * t);
      out[p + 3] = 255;
    }

    overlayCtx.putImageData(imageData, 0, 0);
  }

  /* ------------------------------------------------------------------------
     Lukis lapisan pewarnaan di atas bingkai sedia ada.
     Blend berlapis ikut data shade — jangan tukar (lihat nota shade).
     ------------------------------------------------------------------------ */
  function paintOverlay(targetCtx, w, h, shade, strength) {
    if (!state.hasMask || strength <= 0) return;

    const mw = overlay256.width;
    const mh = overlay256.height;

    targetCtx.save();
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = "high";

    // Lapisan 1 — warna asas shade (blend berbeza ikut shade)
    targetCtx.globalAlpha = clamp01(strength);
    targetCtx.globalCompositeOperation = shade.blend;
    targetCtx.filter = FEATHER_BLUR; // feather tepi supaya tiada halo bergerigi
    targetCtx.drawImage(overlay256, 0, 0, mw, mh, 0, 0, w, h);

    // Lapisan 2 — kedalaman
    targetCtx.filter = "none";
    targetCtx.globalAlpha = SOFT_LIGHT_ALPHA;
    targetCtx.globalCompositeOperation = "soft-light";
    targetCtx.drawImage(overlay256, 0, 0, mw, mh, 0, 0, w, h);

    // Lapisan 3 — angkat kecerahan (shade lebih cerah dari rambut asal)
    if (shade.lift > 0) {
      targetCtx.globalAlpha = clamp01(shade.lift);
      targetCtx.globalCompositeOperation = "screen";
      targetCtx.drawImage(overlay256, 0, 0, mw, mh, 0, 0, w, h);
    }

    targetCtx.restore();
  }

/* ------------------------------------------------------------------------
     Segmentasi video — maksimum sekali setiap `state.segmentInterval` ms,
     mask terakhir diguna semula antara segmentasi (video kekal lancar).
     ------------------------------------------------------------------------ */
  function segmentVideoFrame(video, timestamp) {
    const segmenter = state.segmenter;
    if (!segmenter) return;

    let result = null;
    try {
      result = segmenter.segmentForVideo(video, timestamp);
    } catch (err) {
      console.warn("[ShadeStudio] segmentForVideo gagal:", err);
      return;
    }
    if (!result || !result.categoryMask) return;

    const mask = result.categoryMask;
    try {
      const mw = mask.width;
      const mh = mask.height;
      const maskU8 = mask.getAsUint8Array();

      // Ambil luminance sumber pada grid mask untuk gradient 3 ton.
      if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
        maskCanvas.width = mw;
        maskCanvas.height = mh;
      }
      maskCtx.drawImage(video, 0, 0, mw, mh);
      const sourceRGBA = maskCtx.getImageData(0, 0, mw, mh).data;

      buildOverlay(maskU8, sourceRGBA, mw, mh, currentShade());
      state.hasMask = true;
    } finally {
      if (typeof result.close === "function") result.close();
    }
  }

  /* ------------------------------------------------------------------------
     Gelung render
     ------------------------------------------------------------------------ */
  function renderLoop() {
    state.rafId = requestAnimationFrame(renderLoop);

    const video = el.video;
    if (!video || video.readyState < 2 || !video.videoWidth) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (el.canvas.width !== w || el.canvas.height !== h) {
      el.canvas.width = w;
      el.canvas.height = h;
    }

    const now = performance.now();

    // 1. Segmentasi (dijadualkan, bukan setiap frame)
    if (now - state.lastSegmentTs >= state.segmentInterval && video.currentTime !== state.lastVideoTime) {
      state.lastVideoTime = video.currentTime;
      state.lastSegmentTs = now;
      segmentVideoFrame(video, now);
    }

    // 2. Lukis video + lapisan warna
    const shade = currentShade();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    if (state.facingMode === "user") {
      // Mirror previu kamera depan (macam cermin) — itu yang user jangka
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    paintOverlay(ctx, w, h, shade, state.strength);
    ctx.restore();

    // 3. Kira FPS purata
    state.frameCount++;
    const elapsed = now - state.startedAt;
    if (elapsed >= 1000) {
      state.fps = Math.round((state.frameCount * 1000) / elapsed);
      state.frameCount = 0;
      state.startedAt = now;
      maybeSwitchToLowPerf(now);
    }
  }

  /* ------------------------------------------------------------------------
     Mod prestasi rendah — FPS < 12 → segmentasi setiap 140ms + resolusi turun
     ------------------------------------------------------------------------ */
  function maybeSwitchToLowPerf(now) {
    if (state.lowPerf || !state.cameraOn) return;
    if (now - state.cameraStartedAt < LOW_FPS_GRACE_MS) return; // beri masa pemanasan
    if (state.fps >= LOW_FPS_THRESHOLD) return;

    state.lowPerf = true;
    state.segmentInterval = SEGMENT_INTERVAL_LOW_PERF;
    setPerfNote("Mod prestasi rendah — peranti anda agak perlahan, jadi previu dikurangkan supaya kekal lancar.");

    const track = state.stream && state.stream.getVideoTracks ? state.stream.getVideoTracks()[0] : null;
    if (track && typeof track.applyConstraints === "function") {
      track
        .applyConstraints({
          width: { ideal: LOW_PERF_WIDTH_IDEAL },
          height: { ideal: LOW_PERF_HEIGHT_IDEAL }
        })
        .catch(function () { /* tidak kritikal */ });
    }
  }

/* ------------------------------------------------------------------------
     Mod gambar (fallback) — runningMode "IMAGE".
     Guna fungsi pewarnaan yang SAMA (buildOverlay + paintOverlay).
     ------------------------------------------------------------------------ */
  async function handleUpload(file) {
    if (!file || state.loading) return;
    if (!/^image\//i.test(file.type)) {
      setStatus("Fail itu bukan gambar. Sila pilih fail imej (JPG, PNG atau WebP).");
      return;
    }

    state.loading = true;
    setButtonBusy(true);
    try {
      stopCamera();
      let modelOk = true;
      try {
        await loadSegmenter("IMAGE");
      } catch (modelErr) {
        modelOk = false;
        console.warn("[ShadeStudio] Model gagal dimuat — simulasi penuh digunakan:", modelErr);
      }

      const objectUrl = URL.createObjectURL(file);
      try {
        await new Promise(function (resolve, reject) {
          uploadImage.onload = function () { resolve(); };
          uploadImage.onerror = function () { reject(new Error("Gambar tidak dapat didekod.")); };
          uploadImage.src = objectUrl;
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }

      prepareUploadedImage();
      setPlaceholderVisible(false);
      setStatus("Menganalisis gambar anda dalam peranti...", true);

      state.mode = "image";
      state.modelUnavailable = !modelOk;
      if (modelOk) {
        segmentUploadedImage();
      }
      redrawImage();

      if (el.captureBtn) el.captureBtn.disabled = false;
      if (el.switchBtn) el.switchBtn.hidden = true;
      if (el.startBtn) {
        el.startBtn.textContent = "MULA KAMERA";
        el.startBtn.setAttribute("aria-pressed", "false");
      }
      setStatus(modelOk
        ? "Gambar diproses dalam peranti ini sahaja. Pilih tona lain untuk bandingkan."
        : "Simulasi penuh keseluruhan gambar (segmentasi rambut tiada — model/CDN gagal). Pilih tona lain untuk bandingkan.");
    } catch (err) {
      console.warn("[ShadeStudio] Muat naik gambar gagal:", err);
      setStatus("Gambar tidak dapat diproses. Sila cuba gambar lain, atau guna kamera.");
      setPlaceholderVisible(true);
      state.mode = "idle";
    } finally {
      state.loading = false;
      setButtonBusy(false);
      if (el.fileInput) el.fileInput.value = "";
    }
  }

  function prepareUploadedImage() {
    const iw = uploadImage.naturalWidth;
    const ih = uploadImage.naturalHeight;
    if (!iw || !ih) return;

    const size = Math.min(IMAGE_MAX_SIZE, Math.max(iw, ih));
    if (imageCanvas.width !== size || imageCanvas.height !== size) {
      imageCanvas.width = size;
      imageCanvas.height = size;
    }
    if (el.canvas.width !== size || el.canvas.height !== size) {
      el.canvas.width = size;
      el.canvas.height = size;
    }

    // Potong "cover" ke segi empat sama — kekalkan nisbah, tiada penyekatan.
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    imageCtx.save();
    imageCtx.setTransform(1, 0, 0, 1, 0, 0);
    imageCtx.globalAlpha = 1;
    imageCtx.globalCompositeOperation = "source-over";
    imageCtx.filter = "none";
    imageCtx.clearRect(0, 0, size, size);
    imageCtx.drawImage(uploadImage, (size - dw) / 2, (size - dh) / 2, dw, dh);
    imageCtx.restore();
  }

  function segmentUploadedImage() {
    const segmenter = state.segmenter;
    if (!segmenter || !imageCanvas.width) return;

    let result = null;
    try {
      result = segmenter.segment(imageCanvas);
    } catch (err) {
      console.warn("[ShadeStudio] segment() gagal:", err);
      return;
    }
    if (!result || !result.categoryMask) {
      if (result && typeof result.close === "function") result.close();
      return;
    }

    const mask = result.categoryMask;
    try {
      const mw = mask.width;
      const mh = mask.height;
      const maskU8 = mask.getAsUint8Array();

      if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
        maskCanvas.width = mw;
        maskCanvas.height = mh;
      }
      maskCtx.drawImage(imageCanvas, 0, 0, mw, mh);
      const sourceRGBA = maskCtx.getImageData(0, 0, mw, mh).data;

      // Simpan salinan: objek mask dibebaskan selepas close(), dan kita mahu
      // boleh melukis semula bila pengguna tukar tona tanpa inference baru.
      state.imageCache = { mask: maskU8.slice(), source: sourceRGBA, w: mw, h: mh };

      buildOverlay(state.imageCache.mask, sourceRGBA, mw, mh, currentShade());
      state.hasMask = true;
    } finally {
      if (typeof result.close === "function") result.close();
    }
  }

  function rebuildOverlayFromCache() {
    const cache = state.imageCache;
    if (!cache) return false;
    buildOverlay(cache.mask, cache.source, cache.w, cache.h, currentShade());
    state.hasMask = true;
    return true;
  }

  function redrawImage() {
    if (state.mode !== "image" || !imageCanvas.width) return;
    const size = imageCanvas.width;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.drawImage(imageCanvas, 0, 0, size, size);
    if (state.modelUnavailable) {
      // Fallback tanpa segmentasi — tonakan penuh yang lembut supaya
      // "MUAT NAIK GAMBAR" tetap berfungsi walau model/CDN gagal.
      paintFullTint(ctx, size, size, currentShade(), state.strength);
    } else {
      paintOverlay(ctx, size, size, currentShade(), state.strength);
    }
    ctx.restore();
  }

  /* Tonakan penuh (soft-light) — fallback bila segmentasi tidak tersedia. */
  function paintFullTint(targetCtx, w, h, shade, strength) {
    if (strength <= 0) return;
    const dark = hexToRgb(shade.shadow);
    const light = hexToRgb(shade.highlight);
    const mid = hexToRgb(shade.hex);
    const grad = targetCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgb(" + light.r + "," + light.g + "," + light.b + ")");
    grad.addColorStop(0.5, "rgb(" + mid.r + "," + mid.g + "," + mid.b + ")");
    grad.addColorStop(1, "rgb(" + dark.r + "," + dark.g + "," + dark.b + ")");
    targetCtx.save();
    targetCtx.globalAlpha = clamp01(strength);
    targetCtx.globalCompositeOperation = "soft-light";
    targetCtx.fillStyle = grad;
    targetCtx.fillRect(0, 0, w, h);
    targetCtx.restore();
  }

/* ------------------------------------------------------------------------
     Kawalan kamera
     ------------------------------------------------------------------------ */
  function cameraErrorMessage(err) {
    const name = err && err.name ? err.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Akses kamera DISEKAT. 1) Klik ikon kamera/mangga di bar alamat → Benarkan → muat semula. 2) Semak Windows: Tetapan > Privasi & keselamatan > Kamera > benarkan aplikasi desktop & pelayar. Atau guna \"MUAT NAIK GAMBAR\".";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
      return "Tiada kamera dikesan pada peranti ini. Pastikan webcam tidak dilindungi/dilumpuhkan (Fn + kekunci kamera, atau Device Manager). Guna \"MUAT NAIK GAMBAR\" sebagai ganti.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "Kamera sedang digunakan aplikasi lain (Zoom/Teams/Webcam utility). Tutup aplikasi itu dan cuba lagi, atau guna \"MUAT NAIK GAMBAR\".";
    }
    if (name === "AbortError" || name === "InternalServerError") {
      return "Kamera gagal dimulakan (ralat perkakasan/pemandu). Restart laptop, atau guna \"MUAT NAIK GAMBAR\".";
    }
    return "Kamera tidak dapat dimulakan. Guna \"MUAT NAIK GAMBAR\" sebagai ganti — gambar tetap diproses dalam peranti anda.";
  }

  // Diagnostik: tunjuk punca teknikal di console + status kebenaran pelayar.
  async function logCameraDiagnostics(err) {
    console.warn("[ShadeStudio] Kamera gagal:", err && err.name, "-", err && err.message, err);
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: "camera" });
        console.warn("[ShadeStudio] Status kebenaran kamera pelayar:", perm.state);
      }
    } catch (permErr) {
      console.warn("[ShadeStudio] Tidak dapat membaca status kebenaran:", permErr);
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(function (d) { return d.kind === "videoinput"; });
        console.warn("[ShadeStudio] Kamera dikesan:", cams.length, cams.map(function (d) { return d.label || "(label tersembunyi — izin belum diberi)"; }));
      }
    } catch (listErr) {
      console.warn("[ShadeStudio] enumerateDevices gagal:", listErr);
    }
  }

  async function refreshDeviceCount() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== "function") return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      state.deviceCount = devices.filter(function (d) { return d.kind === "videoinput"; }).length;
    } catch (err) {
      state.deviceCount = 0;
    }
    if (el.switchBtn) el.switchBtn.hidden = !(state.cameraOn && state.deviceCount > 1);
  }

  async function startCamera() {
    if (state.loading) return;
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      setStatus("Pelayar anda tidak menyokong akses kamera. Silakan guna \"MUAT NAIK GAMBAR\".");
      setPlaceholderVisible(true);
      return;
    }

    state.loading = true;
    setButtonBusy(true);
    try {
      state.mode = "video";
      // NOTA DESKTOP: webcam biasanya TIDAK melaporkan facingMode, jadi
      // constraint wajib "facingMode: 'user'" akan gagal OverconstrainedError.
      // Guna "ideal" (lembut) + fallback tanpa facingMode.
      const baseVideo = {
        width: { ideal: CAPTURE_WIDTH_IDEAL },
        height: { ideal: CAPTURE_HEIGHT_IDEAL }
      };
      const attempts = [
        { audio: false, video: Object.assign({ facingMode: { ideal: state.facingMode } }, baseVideo) },
        { audio: false, video: baseVideo },                 // tanpa facingMode langsung
        { audio: false, video: true }                       // kamera lalai apa sahaja
      ];

      let stream = null;
      let lastErr = null;
      for (const attempt of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(attempt);
          break;
        } catch (err) {
          lastErr = err;
          console.warn("[ShadeStudio] getUserMedia cubaan gagal:", err && err.name, err);
        }
      }
      if (!stream) throw lastErr || new Error("Kamera tidak dapat dimulakan.");

      state.stream = stream;
      el.video.srcObject = stream;
      const playPromise = el.video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () { /* autoplay mungkin ditahan — previu tetap dicuba */ });
      }

      state.cameraOn = true;
      state.hasMask = false;
      state.imageCache = null;
      state.lastVideoTime = -1;
      state.lastSegmentTs = -Infinity;
      state.lowPerf = false;
      state.segmentInterval = SEGMENT_INTERVAL_NORMAL;
      state.cameraStartedAt = performance.now();
      state.startedAt = performance.now();
      state.frameCount = 0;

      setPerfNote("");
      setPlaceholderVisible(false);
      setStatus("Previu langsung sedang berjalan. Pastikan rambut nampak dalam bingkai.");
      if (el.captureBtn) el.captureBtn.disabled = false;
      if (el.startBtn) {
        el.startBtn.textContent = "HENTIKAN KAMERA";
        el.startBtn.setAttribute("aria-pressed", "true");
      }

      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.rafId = requestAnimationFrame(renderLoop);

      // Model 16 MB dimuat SECARA BERLATAR — previu kamera hidup dahulu,
      // warna mula dilaksanakan sebaik model siap. Kalau CDN/rangkaian disekat,
      // kamera TETAP berjalan (tanpa warna) dan mesej jelas diberi.
      state.modelReady = false;
      state.modelUnavailable = false;
      loadSegmenter("VIDEO")
        .then(function () {
          state.modelReady = true;
          state.modelUnavailable = false;
          state.lastSegmentTs = -Infinity;
          setStatus("Model siap — simulasi warna kini aktif pada rambut anda.");
        })
        .catch(function (modelErr) {
          state.modelUnavailable = true;
          console.warn("[ShadeStudio] Model gagal dimuat:", modelErr);
          setStatus("Previu kamera berjalan, tetapi model simulasi tidak dapat dimuat (CDN/rangkaian disekat) — warna tiada buat sementara. Cuba rangkaian/pelayar lain.");
        });

      await refreshDeviceCount();
    } catch (err) {
      await logCameraDiagnostics(err);
      stopCamera();
      setStatus(cameraErrorMessage(err));
      setPlaceholderVisible(true);
    } finally {
      state.loading = false;
      setButtonBusy(false);
    }
  }

function stopCamera() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.stream) {
      state.stream.getTracks().forEach(function (track) { track.stop(); });
      state.stream = null;
    }
    if (el.video) el.video.srcObject = null;

    state.cameraOn = false;
    state.hasMask = false;
    state.mode = "idle";
    state.fps = 0;
    state.frameCount = 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);

    setStatus("");
    setPerfNote("");
    setPlaceholderVisible(true);
    if (el.captureBtn) el.captureBtn.disabled = true;
    if (el.switchBtn) el.switchBtn.hidden = true;
    if (el.startBtn) {
      el.startBtn.textContent = "MULA KAMERA";
      el.startBtn.setAttribute("aria-pressed", "false");
    }
  }

  async function switchCamera() {
    if (!state.cameraOn || state.loading) return;
    state.facingMode = state.facingMode === "user" ? "environment" : "user";
    stopCamera();
    await startCamera();
  }

  function captureFrame() {
    if (state.mode !== "video" && state.mode !== "image") return;
    if (typeof el.canvas.toBlob !== "function") {
      setStatus("Peranti ini tidak menyokong simpan gambar.");
      return;
    }
    const shade = currentShade();
    el.canvas.toBlob(function (blob) {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inai-republic-" + shade.id + "-simulasi.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      setStatus("Gambar simulasi disimpan — boleh banding sebelum & selepas.");
    }, "image/png");
  }

/* ------------------------------------------------------------------------
     Pilihan tona + kekuatan
     ------------------------------------------------------------------------ */
  function selectShade(index) {
    if (index < 0 || index >= SHADES.length) return;
    state.shadeIndex = index;
    const shade = SHADES[index];
    const button = el.shadeButtons[index];
    const desc = button ? button.getAttribute("data-desc") : "";

    el.shadeButtons.forEach(function (btn, i) {
      const on = i === index;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });

    if (el.shadeName) el.shadeName.textContent = shade.name.toUpperCase();
    if (el.shadeDesc && desc) el.shadeDesc.textContent = desc;

    // Nilai awal slider ikut kekuatan shade yang dipilih.
    state.strength = shade.strength;
    if (el.strength) el.strength.value = String(Math.round(shade.strength * 100));
    if (el.strengthValue) el.strengthValue.textContent = Math.round(shade.strength * 100) + "%";

    repaint();
  }

  function repaint() {
    if (state.mode === "image") {
      rebuildOverlayFromCache();
      redrawImage();
      return;
    }
    if (state.mode === "video" && state.cameraOn) {
      // Paksa segmentasi pada frame seterusnya supaya warna baru muncul segera.
      state.lastSegmentTs = -Infinity;
    }
  }

  /* ------------------------------------------------------------------------
     Utiliti UI
     ------------------------------------------------------------------------ */
  function setButtonBusy(busy) {
    [el.startBtn, el.uploadBtn, el.captureBtn].forEach(function (btn) {
      if (!btn) return;
      if (busy) {
        // Simpan keadaan asal supaya butang yang sememangnya disabled kekal disabled.
        if (!btn.hasAttribute("data-was-disabled")) {
          btn.setAttribute("data-was-disabled", btn.disabled ? "1" : "0");
        }
        btn.setAttribute("aria-busy", "true");
        btn.disabled = true;
      } else {
        const wasDisabled = btn.getAttribute("data-was-disabled") === "1";
        btn.removeAttribute("aria-busy");
        btn.removeAttribute("data-was-disabled");
        btn.disabled = wasDisabled;
      }
    });
    if (!busy && el.captureBtn) {
      el.captureBtn.disabled = !(state.mode === "video" || state.mode === "image");
    }
    if (!busy && el.startBtn) {
      el.startBtn.disabled = false;
    }
    if (!busy && el.uploadBtn) {
      el.uploadBtn.disabled = false;
    }
  }

/* ------------------------------------------------------------------------
     Pendaftaran acara
     ------------------------------------------------------------------------ */
  function bindEvents() {
    if (el.startBtn) {
      el.startBtn.addEventListener("click", function () {
        if (state.cameraOn) stopCamera();
        else startCamera();
      });
    }

    if (el.uploadBtn && el.fileInput) {
      el.uploadBtn.addEventListener("click", function () {
        if (state.loading) return;
        el.fileInput.click();
      });
      el.fileInput.addEventListener("change", function () {
        const file = el.fileInput.files && el.fileInput.files[0];
        handleUpload(file);
      });
    }

    if (el.captureBtn) el.captureBtn.addEventListener("click", captureFrame);
    if (el.switchBtn) el.switchBtn.addEventListener("click", switchCamera);

    if (el.strength) {
      el.strength.addEventListener("input", function () {
        const pct = parseInt(el.strength.value, 10);
        const safe = isNaN(pct) ? 0 : pct;
        state.strength = clamp01(safe / 100);
        if (el.strengthValue) el.strengthValue.textContent = safe + "%";
        if (state.mode === "video" && state.cameraOn) state.lastSegmentTs = -Infinity;
        else repaint();
      });
    }

    el.shadeButtons.forEach(function (btn, index) {
      btn.addEventListener("click", function () { selectShade(index); });
    });

    if (el.addBtn) {
      el.addBtn.addEventListener("click", function () {
        const shade = currentShade();
        const product = {
          id: "shade-studio-" + shade.id,
          name: "Inai Rambut Botani — " + shade.name,
          shade: "Tona Studio: " + shade.name + " • 60ml",
          price: 39.0,
          img: shade.img
        };
        if (typeof window.inaiRepublicAddToCart === "function") {
          window.inaiRepublicAddToCart(product);
        } else {
          console.warn("[ShadeStudio] Hook troli tidak tersedia.");
        }
      });
    }

    // Hentikan kamera bila tab disembunyikan — jimat bateri & privasi.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state.cameraOn) stopCamera();
    });
  }

  /* ------------------------------------------------------------------------
     Fallback gambar swatch — kalau fail webp belum ada, tunjuk band tona
     supaya susun atur kekal kemas (tiada ikon gambar rosak).
     ------------------------------------------------------------------------ */
  function bindSwatchFallbacks() {
    const images = document.querySelectorAll(".shade-swatch-img");
    Array.prototype.forEach.call(images, function (img) {
      const markEmpty = function () {
        if (img.parentNode) img.parentNode.classList.add("is-empty");
      };
      img.addEventListener("error", markEmpty);
      // Gambar yang gagal sebelum listener dipasang (cache) tetap dikesan.
      if (img.complete && img.naturalWidth === 0) markEmpty();
    });
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  bindSwatchFallbacks();
  setPlaceholderVisible(true);
  bindEvents();
  selectShade(state.shadeIndex);
  refreshDeviceCount();
}