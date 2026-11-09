import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_MODULE;
if (!playwrightModule) throw new Error("PLAYWRIGHT_MODULE must point to the installed Playwright package.");
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const baseURL = process.env.UNIBUD_E2E_BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const owner = "10000000-0000-4000-8000-000000000001";
const personalId = "20000000-0000-4000-8000-000000000001";
const creatorId = "20000000-0000-4000-8000-000000000002";
const pageId = "20000000-0000-4000-8000-000000000003";
const inviteId = "60000000-0000-4000-8000-000000000001";

function profile(id, kind, handle, displayName) {
  return {
    accountId: owner, relationship: "owner", membershipStatus: "active", canSwitchToProfile: true,
    profile: { id, ownerAccountId: owner, kind, handle, displayName, visibility: "private", status: "active" }
  };
}
const personal = profile(personalId, "personal", "oracle", "Oracle");
const creator = profile(creatorId, "creator", "oracle.creates", "Oracle Creates");
const community = profile(pageId, "page_community", "campus.community", "Campus Community");

async function newPage() { return browser.newPage(); }
async function openProfiles(page) {
  await page.goto(baseURL + "/e2e/profiles");
  await page.getByRole("heading", { name: "Switch identity" }).waitFor();
}
async function json(route, status, body, headers = {}) {
  await route.fulfill({ status, contentType: "application/json", headers, body: JSON.stringify(body) });
}

try {
  // Creation is exercised through the real React form and HTTP request boundary.
  {
    const page = await newPage();
    let profiles = [personal];
    let createPayload;
    await page.route("**/api/profiles", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, profiles });
      if (route.request().method() === "POST") {
        createPayload = route.request().postDataJSON();
        profiles = [...profiles, profile("20000000-0000-4000-8000-000000000004", "page_community", "new.campus", "New Campus")];
        return json(route, 201, { ok: true, profile: profiles[1] });
      }
      return json(route, 405, { ok: false });
    });
    await openProfiles(page);
    await page.getByLabel("Profile type").selectOption("page_community");
    await page.getByLabel("Display name").fill("New Campus");
    await page.getByLabel("Unique handle").fill("new.campus");
    await page.getByRole("button", { name: "Create profile" }).click();
    await page.getByText("Your new profile has been created.").waitFor();
    await page.getByRole("heading", { name: "New Campus" }).waitFor();
    assert.deepEqual(createPayload, { kind: "page_community", handle: "new.campus", displayName: "New Campus", visibility: "private" });
    await page.close();
  }

  // Switching sends only the target profile ID; the server remains the authority.
  {
    const page = await newPage();
    await page.route("**/home", route => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Home workspace</h1>" }));
    let switchPayload;
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal, creator] }));
    await page.route("**/api/profiles/switch", async route => {
      switchPayload = route.request().postDataJSON();
      return json(route, 200, { ok: true, activeProfile: { activeProfileId: creatorId } });
    });
    await openProfiles(page);
    await page.getByRole("button", { name: "Switch" }).click();
    await page.getByRole("heading", { name: "Home workspace" }).waitFor();
    assert.deepEqual(switchPayload, { profileId: creatorId });
    await page.close();
  }

  // Owners invite by public-facing UNIBUD handle; no account ID is collected.
  {
    const page = await newPage();
    let invitePayload;
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal, community] }));
    await page.route("**/api/profiles/delegations**", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, delegatedAccess: [] });
      if (route.request().method() === "POST") {
        invitePayload = route.request().postDataJSON();
        return json(route, 201, { ok: true, invitation: { id: inviteId } });
      }
      return json(route, 405, { ok: false });
    });
    await page.route("**/api/profile-invitations", route => json(route, 200, { ok: true, invitations: [] }));
    await openProfiles(page);
    await page.getByLabel("Find a UNIBUD identity").fill("@campus.editor");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await page.getByText("Invitation sent. Access stays pending until the recipient accepts.").waitFor();
    assert.deepEqual(invitePayload, { profileId: pageId, inviteeHandle: "@campus.editor", role: "editor", canSwitchToProfile: false });
    assert.equal("delegateAccountId" in invitePayload, false);
    await page.close();
  }

  // Recipient acceptance uses the invitation ID only, never a supplied account ID.
  {
    const page = await newPage();
    let pending = [{
      id: inviteId, profileId: pageId, profileName: "Campus Community", profileHandle: "campus.community",
      ownerDisplayName: "Campus Owner", ownerHandle: "campus.owner", role: "editor",
      canSwitchToProfile: true, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
    }];
    let responsePayload;
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal] }));
    await page.route("**/api/profiles/delegations**", route => json(route, 200, { ok: true, delegatedAccess: [] }));
    await page.route("**/api/profile-invitations", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, invitations: pending });
      responsePayload = route.request().postDataJSON();
      pending = [];
      return json(route, 200, { ok: true });
    });
    await openProfiles(page);
    await page.getByRole("button", { name: "Accept" }).click();
    await page.getByText("Invitation accepted. The page is now available in your profile switcher.").waitFor();
    assert.deepEqual(responsePayload, { invitationId: inviteId, accept: true });
    await page.close();
  }

  process.stdout.write("PASS: profile create, switch, handle invitation and recipient acceptance browser workflows.\\n");
} finally {
  await browser.close();
}
