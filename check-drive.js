const https = require('https');
const fs = require('fs');

const id = '1ZSmL6i9GcoGU1Zz1_-XrK6v8PIH1SXYK';
const url = 'https://drive.google.com/uc?export=download&id=' + id;
const out = 'hero-new-download.bin';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('TYPE:', res.headers['content-type']);
  console.log('LEN:', res.headers['content-length']);
  console.log('LOCATION:', res.headers['location']);
  if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers['location']) {
    https.get(res.headers['location'], { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
      console.log('R2 STATUS:', r2.statusCode, 'TYPE:', r2.headers['content-type'], 'LEN:', r2.headers['content-length']);
      const f = fs.createWriteStream(out);
      r2.pipe(f);
      f.on('finish', () => { f.close(); console.log('SAVED'); });
    });
  } else {
    const f = fs.createWriteStream(out);
    res.pipe(f);
    f.on('finish', () => { f.close(); console.log('SAVED'); });
  }
}).on('error', (e) => console.log('ERR', e.message));
