console.log("[app] script loaded"); // You MUST see this after refresh

(async () => {
  // ---- CONFIG (replace these) ----
  const DOMAIN = "dev-ajpiv5ho3pze4hxh.us.auth0.com";
  const CLIENTID = "WEWimGffakZxFFcDVXuiqtCGAKl85zrO";
  const CLAIM_KEY = "https://edrisahmady.com/superblocks/token"; // from your Action
  const EMBED_SRC =
    "https://app.superblocks.com/embed/applications/6e427632-7ba5-45b4-acfb-d83b48cc71c4";

  // ---- UI handles ----
  const ui = {
    statusCard: document.getElementById("statusCard"),
    statusText: document.getElementById("statusText"),
    loginBtn: document.getElementById("loginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    errorBox: document.getElementById("errorBox"),
    sb: document.getElementById("sbAppContainer"),
  };

  const showErr = (msg) => {
    ui.errorBox.style.display = "block";
    ui.errorBox.textContent = String(msg);
  };

  // ---- Ensure Auth0 SDK is present ----
  if (!window.auth0 || !auth0.createAuth0Client) {
    ui.statusText.textContent = "Auth0 SDK failed to load.";
    showErr(
      "window.auth0.createAuth0Client missing. Check Network tab for the SDK URL (should be 200)."
    );
    return;
  }

  ui.statusText.textContent = "Creating Auth0 client…";
  const a0 = await auth0.createAuth0Client({
    domain: DOMAIN,
    clientId: CLIENTID,
    authorizationParams: { redirect_uri: window.location.origin },
  });

  // ---- Handle redirect callback after login ----
  if (location.search.includes("code=") && location.search.includes("state=")) {
    console.log("[app] handling redirect callback…");
    try {
      await a0.handleRedirectCallback();
      history.replaceState({}, document.title, location.pathname);
      console.log("[app] redirect handled; URL cleaned");
    } catch (e) {
      ui.statusText.textContent = "Auth error during redirect handling";
      showErr(e.message || e);
      return;
    }
  }

  // ---- Auth state ----
  const authed = await a0.isAuthenticated();
  if (!authed) {
    ui.statusText.textContent = "You need to log in to view the embed.";
    ui.loginBtn.style.display = "inline-block";
    ui.loginBtn.onclick = () => a0.loginWithRedirect();
    return;
  }

  ui.logoutBtn.style.display = "inline-block";
  ui.logoutBtn.onclick = () =>
    a0.logout({ logoutParams: { returnTo: window.location.origin } });

  // ---- Get ID token claims and pull Superblocks token ----
  ui.statusText.textContent = "Fetching ID token claims…";
  const claims = await a0.getIdTokenClaims();
  console.log("[app] claims:", claims);

  const sbToken = claims?.[CLAIM_KEY];
  if (!sbToken) {
    ui.statusText.textContent =
      "Authenticated, but missing Superblocks token claim.";
    showErr(
      `Claim ${CLAIM_KEY} not found. Verify your Auth0 Action and that it's in the ID token.`
    );
    return;
  }

  // ---- Render the embed in-place (no redirect off your domain) ----
  console.log("[app] got superblocks token; rendering embed…");
  const embed = Superblocks.createSuperblocksEmbed({
    src: EMBED_SRC,
    token: sbToken,
  });
  ui.statusCard.style.display = "none";
  ui.sb.style.display = "block";
  embed.render("#sbAppContainer");
})().catch((e) => {
  console.error("[app] fatal:", e);
  const statusText = document.getElementById("statusText");
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("errorBox");
  statusText.textContent = "Auth error";
  loginBtn.style.display = "inline-block";
  errorBox.style.display = "block";
  errorBox.textContent = e?.message || String(e);
});
