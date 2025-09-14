#!/usr/bin/env node
/**
 * build-sprite.js
 * Genera un sprite de íconos desde /icons/src → /public/sprite.svg
 *
 * Requisitos:
 *   npm i -D svgstore svgo
 *
 * Uso:
 *   node scripts/build-sprite.js
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import svgstore from "svgstore";
import { optimize } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas (ajústalas si quieres)
const SRC_DIR = path.resolve(__dirname, "svg");
const OUT_DIR = path.resolve(__dirname, "public");
const OUT_FILE = "sprite.svg";

// Plugins SVGO seguros (mantiene viewBox, quita dimensiones, scripts, etc.)
const SVGO_OPTS = {
  multipass: true,
  plugins: [
    { name: "removeViewBox", active: false }, // ¡No quitar viewBox!
    { name: "removeDimensions", active: true },
    { name: "cleanupIds", params: { remove: true } },
    { name: "removeScripts", active: true },
    { name: "removeUnknownsAndDefaults", active: true }
  ]
};

// Inserta xmlns y xmlns:xlink si faltan (Chrome/otros lo requieren)
function addRootNamespaces(svgString) {
  const hasXmlns = /xmlns=(['"])http:\/\/www\.w3\.org\/2000\/svg\1/.test(svgString);
  const hasXlink = /xmlns:xlink=(['"])http:\/\/www\.w3\.org\/1999\/xlink\1/.test(svgString);
  return svgString.replace(/<svg\b([^>]*)>/, (m, attrs) => {
    const addNs = hasXmlns ? "" : ' xmlns="http://www.w3.org/2000/svg"';
    const addXlink = hasXlink ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    return `<svg${attrs}${addNs}${addXlink}>`;
  });
}

async function build() {
  const sprite = svgstore({
    inline: true,
    cleanDefs: true,
    // Atributos por defecto en cada <symbol> (opcional)
    symbolAttrs: { role: "img" }
  });

  // Asegura carpetas
  await fs.mkdir(SRC_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = (await fs.readdir(SRC_DIR)).filter(f => f.endsWith(".svg"));
  if (!files.length) {
    console.warn(`⚠️  No se encontraron SVG en ${SRC_DIR}`);
  }

  for (const file of files) {
    const id = path.basename(file, ".svg"); // id del <symbol>
    const raw = await fs.readFile(path.join(SRC_DIR, file), "utf8");

    // Limpieza con SVGO (manteniendo viewBox)
    const { data } = optimize(raw, SVGO_OPTS);

    // Agrega como <symbol id="..."> al sprite
    sprite.add(id, data);
  }

  // Serializa sprite e inyecta namespaces si faltan
  let output = sprite.toString({ inline: true });
  output = addRootNamespaces(output);

  await fs.writeFile(path.join(OUT_DIR, OUT_FILE), output, "utf8");
  console.log(`✅ Sprite generado: ${path.join(OUT_DIR, OUT_FILE)}`);
}

build().catch(err => {
  console.error("❌ Error generando sprite:", err);
  process.exit(1);
});
