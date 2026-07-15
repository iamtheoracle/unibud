import test from "node:test";
import assert from "node:assert/strict";
import { VersionManager } from "../components/version-manager.js";

test("version manager tracks versions and compatibility", () => {
  const versions = new VersionManager("1.0.0");
  versions.registerModuleVersion("alpha", "2.3.4");
  assert.equal(versions.getModuleVersion("alpha"), "2.3.4");
  assert.equal(versions.isCompatible("1.2.0", "1.1.9"), true);
  assert.equal(versions.isCompatible("2.0.0", "1.9.9"), false);
});
