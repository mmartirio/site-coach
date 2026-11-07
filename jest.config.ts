import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  // O build (.next/standalone) tem uma cópia do package.json que confunde o Jest.
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

export default createJestConfig(config);
