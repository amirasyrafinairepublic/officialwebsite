/* Verify every remote image URL referenced by the shop catalogue.
   Run: node tools/check-urls.js   (writes tools/urls-log.txt) */
const fs = require("fs");

const code = fs.readFileSync("js/shop-data.js", "utf8");
const urls = Array.from(new Set(code.match(/https:\/\/[^\s"]+/g) || []));
const log = [];
let next = 0;
let failures = 0;

async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        redirect: "follow"
      });
      const ok = res.ok || res.status === 206;
      log.push((ok ? "OK " : "HTTP " + res.status + " ") + url);
      if (!ok) failures += 1;
      try { await res.body.cancel(); } catch (e) { /* ignore */ }
    } catch (e) {
      failures += 1;
      log.push("ERR " + url + " (" + (e && e.name) + ")");
    }
  }
}

(async () => {
  await Promise.all(Array.from({ length: 6 }, worker));
  log.push("");
  log.push("TOTAL: " + urls.length + " unique URLs, failures: " + failures);
  fs.writeFileSync("tools/urls-log.txt", log.join("\n") + "\n", "utf8");
  console.log(log.join("\n"));
  process.exit(failures ? 1 : 0);
})();
