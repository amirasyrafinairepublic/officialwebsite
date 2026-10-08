/* Cleanup: report existence, delete only this task's scaffolding, re-check.
   Run: node tools/cleanup.js  (writes tools/cleanup-log.txt) */
const fs = require("fs");

const mine = [
  "tools/versions.txt",
  "tools/t-node.txt",
  "tools/t-py.txt",
  "tools/patch-shop.py",
  "tools/run-out.txt",
  "tools/root-list.txt",
  "tools/git-status.txt",
  "tools/smoke-exit.txt",
  "tools-del.txt",
  "deletelog.txt",
  "dl.txt"
];
/* _v.txt and *_log.txt / scripts are deliberately NOT touched. */

const log = [];
mine.forEach((f) => {
  const before = fs.existsSync(f);
  let after = before;
  if (before) {
    try { fs.unlinkSync(f); after = fs.existsSync(f); }
    catch (e) { log.push("DEL-ERR " + f + " (" + e.message + ")"); return; }
  }
  log.push((before ? (after ? "STILL-EXISTS " : "DELETED ") : "NOT-FOUND ") + f);
});
fs.writeFileSync("tools/cleanup-log.txt", log.join("\n") + "\n", "utf8");
console.log(log.join("\n"));
