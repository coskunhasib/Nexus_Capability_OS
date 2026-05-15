import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'dist', 'assets');

const limits = {
  maxInitialJsBytes: 300 * 1024,
  maxSingleJsChunkBytes: 500 * 1024,
  maxTotalJsBytes: 1200 * 1024,
  maxCssBytes: 80 * 1024,
};

function format(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

if (!fs.existsSync(assetsDir)) {
  console.error('Missing dist/assets. Run vite build before checking bundle budget.');
  process.exit(1);
}

const assets = fs.readdirSync(assetsDir)
  .map((name) => {
    const filePath = path.join(assetsDir, name);
    const stat = fs.statSync(filePath);
    return { name, bytes: stat.size, type: name.endsWith('.js') ? 'js' : name.endsWith('.css') ? 'css' : 'other' };
  })
  .filter((asset) => asset.type === 'js' || asset.type === 'css')
  .sort((a, b) => b.bytes - a.bytes);

const jsAssets = assets.filter((asset) => asset.type === 'js');
const cssAssets = assets.filter((asset) => asset.type === 'css');
const initialJs = jsAssets.find((asset) => /^index-[\w-]+\.js$/.test(asset.name));
const largestJs = jsAssets[0];
const totalJsBytes = jsAssets.reduce((sum, asset) => sum + asset.bytes, 0);
const totalCssBytes = cssAssets.reduce((sum, asset) => sum + asset.bytes, 0);

const checks = [
  {
    name: 'initial index JS within budget',
    pass: Boolean(initialJs) && initialJs.bytes <= limits.maxInitialJsBytes,
    actual: initialJs ? format(initialJs.bytes) : 'missing',
    limit: format(limits.maxInitialJsBytes),
  },
  {
    name: 'largest JS chunk within budget',
    pass: Boolean(largestJs) && largestJs.bytes <= limits.maxSingleJsChunkBytes,
    actual: largestJs ? `${largestJs.name} ${format(largestJs.bytes)}` : 'missing',
    limit: format(limits.maxSingleJsChunkBytes),
  },
  {
    name: 'total JS within budget',
    pass: totalJsBytes <= limits.maxTotalJsBytes,
    actual: format(totalJsBytes),
    limit: format(limits.maxTotalJsBytes),
  },
  {
    name: 'total CSS within budget',
    pass: totalCssBytes <= limits.maxCssBytes,
    actual: format(totalCssBytes),
    limit: format(limits.maxCssBytes),
  },
];

const summary = {
  status: checks.every((check) => check.pass) ? 'pass' : 'fail',
  checks,
  top_assets: assets.slice(0, 12).map((asset) => ({ name: asset.name, type: asset.type, size: format(asset.bytes) })),
};

console.log(JSON.stringify(summary, null, 2));

if (summary.status !== 'pass') {
  console.error('Bundle budget check failed. Consider lazy loading, vendor splitting, or reducing generated payload imports.');
  process.exit(1);
}
