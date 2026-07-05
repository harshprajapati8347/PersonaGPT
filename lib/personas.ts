import fs from "fs";
import path from "path";

const hitesh = fs
  .readFileSync(path.join(process.cwd(), "lib", "persona.hitesh.md"), "utf-8")
  .trim();

const piyush = fs
  .readFileSync(path.join(process.cwd(), "lib", "persona.piyush.md"), "utf-8")
  .trim();

export const personas = {
  hitesh,
  piyush,
};

export type PersonaKey = keyof typeof personas;
