import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());

const read = (filePath) => fs.readFileSync(path.join(repoRoot, filePath), "utf8");

describe("navigation route regressions", () => {
  it("keeps Bud and results routes wired in App", () => {
    const appSource = read("src/App.jsx");
    expect(appSource).toContain('path="/bud"');
    expect(appSource).toContain('path="/results"');
    expect(appSource).toContain('to="/academics/results"');
  });

  it("links AcademicPulse GPA tile to the live results route", () => {
    const pulseSource = read("src/components/academic/AcademicPulse.jsx");
    expect(pulseSource).toContain('to="/academics/results"');
    expect(pulseSource).not.toContain('to="/results"');
  });

  it("uses an existing destination for Bud tab search entry points", () => {
    const budTabSource = read("src/pages/tabs/BudTab.jsx");
    expect(budTabSource).toContain('navigate("/discover")');
    expect(budTabSource).not.toContain('navigate("/search")');
  });
});
