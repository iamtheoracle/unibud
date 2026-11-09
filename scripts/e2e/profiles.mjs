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
    accountId: owner, relationship: "owner", role: "owner", membershipStatus: "active", canSwitchToProfile: true,
    profile: { id, ownerAccountId: owner, kind, handle, displayName, visibility: "private", status: "active" }
  };
}
const personal = profile(personalId, "personal", "oracle", "Oracle");
const creator = profile(creatorId, "creator", "oracle.creates", "Oracle Creates");
const community = profile(pageId, "page_community", "campus.community", "Campus Community");

async function newPage() {
  const page = await browser.newPage();
  await page.route("**/api/profile-ownership-transfers", route =>
    route.request().method() === "GET"
      ? json(route, 200, { ok: true, transfers: [] })
      : json(route, 200, { ok: true })
  );
  await page.route("**/api/profiles/*/ownership-transfer", route =>
    route.request().method() === "GET"
      ? json(route, 200, { ok: true, preflight: { canTransfer: false, activeOwnedProfiles: 1, activeDelegatedRelationships: 0, pendingInvitations: 0, openTransferRequests: 0, personalIdentityAvailable: true }, transfers: [] })
      : json(route, 200, { ok: true, transfer: { id: "90000000-0000-4000-8000-000000000001" } })
  );
  return page;
}
async function openProfiles(page) {
  await page.route("**/api/profile-lifecycle/notifications", route =>
    route.request().method() === "GET"
      ? json(route, 200, { ok: true, notifications: [] })
      : json(route, 200, { ok: true, marked: true })
  );
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
    await page.getByPlaceholder("Community or page name").fill("New Campus");
    await page.getByLabel("Unique handle").fill("new.campus");
    await page.getByRole("button", { name: "Create profile" }).click();
    await page.getByText("Your new profile has been created.").waitFor();
    await page.getByRole("heading", { name: "New Campus" }).waitFor();
    assert.deepEqual(createPayload, { kind: "page_community", handle: "new.campus", displayName: "New Campus", visibility: "private" });
    await page.close();
  }

  // Profile editing is scoped to the selected owned creator/page identity.
  {
    const page = await newPage();
    let updatePayload;
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal, creator] }));
    await page.route("**/api/profiles/" + creatorId, async route => {
      updatePayload = route.request().postDataJSON();
      return json(route, 200, { ok: true, profile: { ...creator, profile: { ...creator.profile, ...updatePayload } } });
    });
    await openProfiles(page);
    const editForm = page.locator("form").filter({ hasText: "Profile to edit" });
    await editForm.getByLabel("Profile to edit").selectOption(creatorId);
    await editForm.getByLabel("Display name").fill("Oracle Studio");
    await editForm.getByLabel("Handle").fill("oracle.studio");
    await editForm.getByLabel("Visibility").selectOption("public");
    await editForm.getByRole("button", { name: "Save profile changes" }).click();
    await page.getByText("Profile details updated.").waitFor();
    assert.deepEqual(updatePayload, { displayName: "Oracle Studio", handle: "oracle.studio", visibility: "public" });
    await page.close();
  }

  // Owners can change a delegate role, suspend/restore access, and cancel pending invitations.
  {
    const page = await newPage();
    const delegate = { ...profile("20000000-0000-4000-8000-000000000005", "page_community", "campus.community", "Campus Community"), accountId: "10000000-0000-4000-8000-000000000002", relationship: "delegated", role: "editor" };
    let membershipPayloads = [];
    let cancellationPayload;
    let delegateRole = "editor";
    let delegateStatus = "active";
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal, community] }));
    await page.route("**/api/profiles/delegations**", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, delegatedAccess: [{ ...delegate, role: delegateRole, membershipStatus: delegateStatus }] });
      if (route.request().method() === "PATCH") { const payload=route.request().postDataJSON(); membershipPayloads.push(payload); delegateRole=payload.role; delegateStatus=payload.status; return json(route, 200, { ok: true }); }
      return json(route, 200, { ok: true });
    });
    await page.route("**/api/profile-invitations**", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, invitations: [{ id: inviteId, profileId: pageId, inviteeHandle: "campus.editor", role: "editor", status: "pending", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+86400000).toISOString() }] });
      cancellationPayload = route.request().postDataJSON();
      return json(route, 200, { ok: true });
    });
    page.on("dialog", dialog => dialog.accept());
    await openProfiles(page);
    const roleSelect = page.locator(".delegate-row").filter({ hasText: "UNIBUD member" }).getByLabel("Role");
    await roleSelect.selectOption("moderator");
    await page.getByRole("button", { name: "Suspend" }).click();
    await page.getByRole("button", { name: "Restore" }).click();
    await page.getByRole("button", { name: "Cancel invitation" }).click();
    assert.equal(membershipPayloads.length, 3);
    assert.deepEqual(membershipPayloads[0], { profileId: pageId, delegateAccountId: delegate.accountId, role: "moderator", status: "active" });
    assert.equal(membershipPayloads[1].status, "suspended");
    assert.equal(membershipPayloads[2].status, "active");
    assert.deepEqual(cancellationPayload, { invitationId: inviteId });
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

  // Profile ownership transfer requires owner reauthentication, recipient consent and owner finalization.
  {
    const page = await newPage();
    let transferState = "pending_recipient";
    let requestPayload, completionPayload;
    const transferId = "90000000-0000-4000-8000-000000000001";
    await page.route("**/api/profiles/archived", route => json(route, 200, { ok: true, profiles: [] }));
    await page.route("**/api/profile-invitations", route => json(route, 200, { ok: true, invitations: [] }));
    await page.route("**/api/profiles/delegations**", route => json(route, 200, { ok: true, delegatedAccess: [] }));
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal, creator] }));
    await page.route("**/api/profile-ownership-transfers", route => json(route, 200, { ok: true, transfers: [] }));
    await page.route("**/api/profiles/" + creatorId + "/ownership-transfer", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true,
        preflight: { canTransfer: true, activeOwnedProfiles: 2, activeDelegatedRelationships: 0, pendingInvitations: 0, openTransferRequests: 0, personalIdentityAvailable: true },
        transfers: transferState === "completed" ? [] : [{ transferId, recipientHandle: "new.owner", status: transferState, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+86400000).toISOString() }]
      });
      requestPayload = route.request().postDataJSON();
      transferState = "recipient_accepted";
      return json(route, 201, { ok: true, transfer: { id: transferId } });
    });
    await page.route("**/api/profile-ownership-transfers/" + transferId + "/complete", async route => {
      completionPayload = route.request().postDataJSON();
      transferState = "completed";
      return json(route, 200, { ok: true });
    });
    page.on("dialog", dialog => dialog.accept());
    await openProfiles(page);
    await page.getByLabel("Recipient's UNIBUD username").fill("@new.owner");
    await page.getByLabel("Account email").fill("owner@example.com");
    await page.getByLabel("Account password").fill("owner-password");
    await page.getByRole("button", { name: "Request ownership transfer" }).click();
    await page.getByText("Transfer request sent. Ownership has not changed; the recipient must accept and you must finalize it.").waitFor();
    assert.deepEqual(requestPayload, { recipientHandle: "@new.owner", channel: "email", identifier: "owner@example.com", password: "owner-password" });
    await page.getByRole("button", { name: "Finalize" }).waitFor();
    await page.getByLabel("Account password").fill("owner-password");
    await page.getByRole("button", { name: "Finalize" }).click();
    assert.deepEqual(completionPayload, { channel: "email", identifier: "owner@example.com", password: "owner-password" });
    await page.close();
  }

  // The intended recipient must reauthenticate before accepting an ownership transfer.
  {
    const page = await newPage();
    const transferId = "90000000-0000-4000-8000-000000000002";
    let responsePayload;
    let pending = [{ transferId, profileId: creatorId, profileName: "Oracle Creates", profileHandle: "oracle.creates",
      ownerHandle: "oracle", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+86400000).toISOString() }];
    await page.route("**/api/profiles/archived", route => json(route, 200, { ok: true, profiles: [] }));
    await page.route("**/api/profile-invitations", route => json(route, 200, { ok: true, invitations: [] }));
    await page.route("**/api/profiles/delegations**", route => json(route, 200, { ok: true, delegatedAccess: [] }));
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [personal] }));
    await page.route("**/api/profile-ownership-transfers", async route => {
      if (route.request().method() === "GET") return json(route, 200, { ok: true, transfers: pending });
      responsePayload = route.request().postDataJSON(); pending = []; return json(route, 200, { ok: true });
    });
    page.on("dialog", dialog => dialog.accept());
    await openProfiles(page);
    await page.getByLabel("Account email").fill("recipient@example.com");
    await page.getByLabel("Account password").fill("recipient-password");
    await page.getByRole("button", { name: "Accept" }).click();
    await page.getByText("Acceptance recorded. The current owner must now finalize the transfer.").waitFor();
    assert.deepEqual(responsePayload, { transferId, accept: true, channel: "email", identifier: "recipient@example.com", password: "recipient-password" });
    await page.close();
  }

  // Owner archive and recovery keeps the personal identity available and exposes immutable history.
  {
    const page = await newPage();
    let activeProfiles = [personal, creator];
    let archivedProfiles = [profile("20000000-0000-4000-8000-000000000006", "page_community", "archived.page", "Archived Page")];
    archivedProfiles[0] = { ...archivedProfiles[0], profile: { ...archivedProfiles[0].profile, status: "archived" } };
    let archived = false;
    let restored = false;
    await page.route("**/api/profiles/archived", route => json(route, 200, { ok: true, profiles: archivedProfiles }));
    await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: activeProfiles }));
    await page.route("**/api/profiles/" + creatorId + "/archive", async route => {
      archived = true;
      activeProfiles = [personal];
      archivedProfiles = [...archivedProfiles, { ...creator, profile: { ...creator.profile, status: "archived" } }];
      return json(route, 200, { ok: true, profileLifecycleUpdated: true });
    });
    await page.route("**/api/profiles/" + archivedProfiles[0].profile.id + "/restore", async route => {
      restored = true;
      archivedProfiles = archivedProfiles.filter(item => item.profile.id !== archivedProfiles[0].profile.id);
      return json(route, 200, { ok: true, profileLifecycleUpdated: true });
    });
    await page.route("**/api/profiles/" + archivedProfiles[0].profile.id + "/history", route => json(route, 200, { ok: true, history: [{ action: "profile.archive", occurredAt: new Date(0).toISOString() }] }));
    page.on("dialog", dialog => dialog.accept());
    await openProfiles(page);
    await page.getByRole("button", { name: "Archive" }).click();
    await page.getByText("Profile archived. Your personal identity and other active profiles remain available.").waitFor();
    assert.equal(archived, true);
    await page.getByRole("heading", { name: "Archived profiles" }).waitFor();
    await page.getByRole("button", { name: "History" }).first().click();
    await page.getByText(/profile.archive/).waitFor();
    await page.getByRole("button", { name: "Restore" }).first().click();
    await page.getByText("Profile restored. It is available in your profile switcher again.").waitFor();
    assert.equal(restored, true);
    await page.close();
  }

  // The active profile shell changes its navigation and identity framing by family.
  {
    const cases = [
      { kind: "personal", name: "Personal profile", nav: ["Connections", "Highlights"], absent: "Publishing" },
      { kind: "creator", name: "Creator profile", nav: ["Publishing", "Featured work", "Audience", "Insights"], absent: "Members" },
      { kind: "page_community", name: "Page / community", nav: ["Announcements", "Members", "Events", "Rules", "Administrators"], absent: "Featured work" }
    ];
    for (const item of cases) {
      const page = await newPage();
      const active = profile(personalId, item.kind, "identity.handle", "Distinct Identity");
      await page.route("**/api/profiles", route => json(route, 200, { ok: true, profiles: [active] }));
      await openProfiles(page);
      const navigation = page.getByRole("navigation", { name: item.name + " sections" });
      await navigation.waitFor();
      for (const label of item.nav) await navigation.getByRole("button", { name: label }).waitFor();
      await assert.rejects(async () => navigation.getByRole("button", { name: item.absent, exact: true }).waitFor({ timeout: 150 }));
      await page.locator("#active-profile-title").getByText("Distinct Identity").waitFor();
      await page.close();
    }
  }

  process.stdout.write("PASS: profile create, edit, switch, family-specific navigation, owner archive, recovery history, restore, handle invitation, recipient acceptance, role change, suspension, restoration and invitation cancellation browser workflows.\\n");
} finally {
  await browser.close();
}
