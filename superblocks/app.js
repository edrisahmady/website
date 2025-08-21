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
    console.error("[app] error:", msg);
    ui.errorBox.style.display = "block";
    ui.errorBox.textContent = String(msg);
  };

  // ---- Ensure Auth0 SDK is present ----
  if (!window.auth0 || !window.auth0.createAuth0Client) {
    ui.statusText.textContent = "Auth0 SDK failed to load.";
    showErr(
      "window.auth0.createAuth0Client missing. Check Network tab for the SDK URL (should be 200)."
    );
    return;
  }

  ui.statusText.textContent = "Creating Auth0 client…";

  let a0;
  try {
    a0 = await window.auth0.createAuth0Client({
      domain: DOMAIN,
      clientId: CLIENTID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        scope: "openid profile email", // Ensure we get ID token
      },
      cacheLocation: "localstorage", // Help with auth state persistence
    });
  } catch (e) {
    ui.statusText.textContent = "Failed to create Auth0 client";
    showErr(e.message || e);
    return;
  }

  console.log("[app] Auth0 client created");

  // ---- Handle redirect callback after login ----
  if (location.search.includes("code=") && location.search.includes("state=")) {
    console.log("[app] handling redirect callback…");
    ui.statusText.textContent = "Processing authentication…";

    try {
      const result = await a0.handleRedirectCallback();
      console.log("[app] redirect callback result:", result);

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("[app] redirect handled; URL cleaned");
    } catch (e) {
      console.error("[app] redirect callback error:", e);
      ui.statusText.textContent = "Authentication failed";
      showErr(`Redirect callback error: ${e.message || e}`);
      return;
    }
  }

  // ---- Check auth state ----
  let authed;
  try {
    authed = await a0.isAuthenticated();
    console.log("[app] authentication status:", authed);
  } catch (e) {
    console.error("[app] error checking auth status:", e);
    ui.statusText.textContent = "Error checking authentication";
    showErr(e.message || e);
    return;
  }

  if (!authed) {
    console.log("[app] user not authenticated, showing login");
    ui.statusText.textContent = "You need to log in to view the embed.";
    ui.loginBtn.style.display = "inline-block";
    ui.loginBtn.onclick = () => {
      console.log("[app] initiating login");
      a0.loginWithRedirect();
    };
    return;
  }

  console.log("[app] user is authenticated");
  ui.logoutBtn.style.display = "inline-block";
  ui.logoutBtn.onclick = () =>
    a0.logout({ logoutParams: { returnTo: window.location.origin } });

  // ---- Get ID token claims and pull Superblocks token ----
  ui.statusText.textContent = "Fetching user information…";

  let claims;
  try {
    claims = await a0.getIdTokenClaims();
    console.log("[app] ID token claims:", claims);
  } catch (e) {
    console.error("[app] error getting ID token claims:", e);
    ui.statusText.textContent = "Error getting user information";
    showErr(`Failed to get ID token claims: ${e.message || e}`);
    return;
  }

  if (!claims) {
    ui.statusText.textContent = "No user claims found";
    showErr(
      "ID token claims are empty. This might be an Auth0 configuration issue."
    );
    return;
  }

  const sbToken = claims[CLAIM_KEY];
  console.log(
    "[app] superblocks token from claims:",
    sbToken ? "present" : "missing"
  );

  if (!sbToken) {
    ui.statusText.textContent = "Missing Superblocks authorization";
    showErr(
      `Claim '${CLAIM_KEY}' not found in ID token. Please verify:\n` +
        `1. Your Auth0 Action is properly configured\n` +
        `2. The Action is added to the Login flow\n` +
        `3. The custom claim is being set in the ID token`
    );
    return;
  }

  // ---- Render the embed ----
  console.log("[app] rendering Superblocks embed");
  ui.statusText.textContent = "Loading application…";

  try {
    const embed = window.Superblocks.createSuperblocksEmbed({
      src: EMBED_SRC,
      token: sbToken,
    });

    ui.statusCard.style.display = "none";
    ui.sb.style.display = "block";
    embed.render("#sbAppContainer");

    console.log("[app] embed rendered successfully");
  } catch (e) {
    console.error("[app] error rendering embed:", e);
    ui.statusText.textContent = "Failed to load application";
    showErr(`Embed render error: ${e.message || e}`);

    // Show the status card again so user can try logout/login
    ui.statusCard.style.display = "block";
  }
})().catch((e) => {
  console.error("[app] fatal error:", e);
  const statusText = document.getElementById("statusText");
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("errorBox");

  if (statusText) statusText.textContent = "Application error";
  if (loginBtn) loginBtn.style.display = "inline-block";
  if (errorBox) {
    errorBox.style.display = "block";
    errorBox.textContent = `Fatal error: ${e?.message || String(e)}`;
  }
});
