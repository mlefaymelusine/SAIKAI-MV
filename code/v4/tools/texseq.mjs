import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
// usage: node texseq.mjs <ver> <compId> <outDir> <fromFrame> <toFrame>   -> <outDir>/NNNN.jpg (0001 = fromFrame)
const [ver, compId, outDir, from, to] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve(`${ver}/src/index.ts`), publicDir: path.resolve(`${ver}/public`)});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: compId, browserExecutable});
const tmp = outDir + '/_tmp'; fs.mkdirSync(tmp, {recursive: true});
await renderFrames({composition, serveUrl, browserExecutable, outputDir: tmp, imageFormat: 'jpeg', jpegQuality: 94, frameRange: [Number(from), Number(to)], concurrency: 4, onStart: () => {}, onFrameUpdate: () => {}});
const files = fs.readdirSync(tmp).filter((f) => (f.endsWith('.jpg') || f.endsWith('.jpeg'))).sort();
files.forEach((f, i) => fs.renameSync(`${tmp}/${f}`, `${outDir}/${String(i + 1).padStart(4, '0')}.jpg`));
fs.rmdirSync(tmp);
console.log('frames', files.length);
