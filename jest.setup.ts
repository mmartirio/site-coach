import "@testing-library/jest-dom";
import { deserialize, serialize } from "node:v8";

// O ambiente jsdom do Jest não expõe structuredClone (os navegadores e o Node expõem).
globalThis.structuredClone ??= <T,>(v: T): T => deserialize(serialize(v));
