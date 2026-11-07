import "@testing-library/jest-dom";
import { deserialize, serialize } from "node:v8";

globalThis.structuredClone ??= <T,>(v: T): T => deserialize(serialize(v));
