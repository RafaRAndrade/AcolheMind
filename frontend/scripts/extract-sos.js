// Extrai a base de situações do SOS (SIT) e a regex de emergência do protótipo para JSON.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8');
const emg = src.match(/var EMG=\/(.*)\/;/)[1];
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('var SIT=['), src.indexOf('var SB={}')), ctx);
fs.writeFileSync(process.argv[3], JSON.stringify({ emg, sit: ctx.SIT }, null, 1));
console.log('OK:', ctx.SIT.length, 'situações');
