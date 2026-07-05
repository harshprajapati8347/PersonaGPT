// Client-safe display metadata for each persona.
// Kept separate from lib/personas.ts, which reads prompt files with `fs` and
// must never be imported into a client component.

export type PersonaId = "hitesh" | "piyush";

export type PersonaMeta = {
  id: PersonaId;
  name: string;
  tagline: string;
  initials: string;
};

export const PERSONA_META: Record<PersonaId, PersonaMeta> = {
  hitesh: {
    id: "hitesh",
    name: "Hitesh Choudhary",
    tagline: "Chai aur Code · calm, why-before-how",
    initials: "HC",
  },
  piyush: {
    id: "piyush",
    name: "Piyush Garg",
    tagline: "Build-along · projects & system design",
    initials: "PG",
  },
};

export const PERSONA_ORDER: PersonaId[] = ["hitesh", "piyush"];
