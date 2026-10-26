// node tools/stills.mjs <outdir> <sec...> : bundle once, render stills at 960x540
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [out, ...secs] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'SaikaiOriginal'});
for (const s of secs) {
  const frame = Math.round(parseFloat(s) * 30);
  await renderStill({serveUrl, composition, frame, output: path.resolve(out, `f_${String(s).padStart(6, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5});
  console.log('ok', s);
}
