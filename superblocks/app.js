console.log("[app] script loaded"); // You MUST see this after refresh

(async () => {
  // ---- CONFIG (replace these) ----
  const DOMAIN = "dev-ajpiv5ho3pze4hxh.us.auth0.com";
  const CLIENTID = "WEWimGffakZxFFcDVXuiqtCGAKl85zrO";
  const EMBED_SRC =
    "https://app.superblocks.com/embed/applications/6e427632-7ba5-45b4-acfb-d83b48cc71c4";

  // Replace this with your actual Superblocks embed token
  const SUPERBLOCKS_EMBED_TOKEN =
    "CEBO3sB9d3b95X7Z1nCrfyFefBL8QwcPEbVQcIKyyErzonCM"; // Get this from your Superblocks app settings

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

  console.log("[app] Creating Auth0 client…");
  ui.statusText.textContent = "Initializing authentication…";

  let a0;
  try {
    a0 = await window.auth0.createAuth0Client({
      domain: DOMAIN,
      clientId: CLIENTID,
      authorizationParams: {
        redirect_uri: "https://edrisahmady.com/superblocks",
        scope: "openid profile email",
      },
      cacheLocation: "localstorage",
    });
    console.log("[app] Auth0 client created successfully");
  } catch (e) {
    console.error("[app] Failed to create Auth0 client:", e);
    ui.statusText.textContent = "Failed to initialize authentication";
    showErr(e.message || e);
    return;
  }

  // ---- Handle redirect callback after login ----
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("code") && urlParams.has("state")) {
    console.log("[app] handling redirect callback…");
    ui.statusText.textContent = "Completing authentication…";

    try {
      const result = await a0.handleRedirectCallback();
      console.log("[app] redirect callback successful:", result);

      // Clean up the URL - remove the query parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log("[app] URL cleaned, proceeding to load app");
    } catch (e) {
      console.error("[app] redirect callback error:", e);
      ui.statusText.textContent = "Authentication failed";
      showErr(`Authentication error: ${e.message || e}`);
      return;
    }
  }

  // ---- Check auth state ----
  console.log("[app] checking authentication status…");
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
    ui.statusText.textContent = "Please log in to access the application.";
    ui.loginBtn.style.display = "inline-block";
    ui.loginBtn.onclick = () => {
      console.log("[app] initiating login");
      a0.loginWithRedirect();
    };
    return;
  }

  console.log("[app] user is authenticated!");

  // Show logout button
  ui.logoutBtn.style.display = "inline-block";
  ui.logoutBtn.onclick = () => {
    console.log("[app] logging out");
    const logoutUrl = window.location.origin + window.location.pathname;
    a0.logout({
      logoutParams: {
        returnTo: logoutUrl,
      },
    });
  };

  // ---- Get user info (optional - for display purposes) ----
  try {
    const user = await a0.getUser();
    console.log("[app] authenticated user:", user);
  } catch (e) {
    console.warn("[app] could not get user info:", e);
    // This is not critical, continue loading the app
  }

  // ---- Render the Superblocks embed ----
  console.log("[app] loading Superblocks application…");
  ui.statusText.textContent = "Loading application…";

  // Validate embed token
  if (
    !SUPERBLOCKS_EMBED_TOKEN ||
    SUPERBLOCKS_EMBED_TOKEN === "your_embed_token_here"
  ) {
    ui.statusText.textContent = "Application not configured";
    showErr("Please set your SUPERBLOCKS_EMBED_TOKEN in the code");
    return;
  }

  try {
    // Ensure Superblocks SDK is loaded
    if (!window.Superblocks || !window.Superblocks.createSuperblocksEmbed) {
      throw new Error(
        "Superblocks SDK not loaded. Check that the embed script is loading correctly."
      );
    }

    console.log("[app] creating Superblocks embed with token");
    const embed = window.Superblocks.createSuperblocksEmbed({
      src: EMBED_SRC,
      token: SUPERBLOCKS_EMBED_TOKEN,
    });

    console.log("[app] hiding status card and showing embed container");
    ui.statusCard.style.display = "none";
    ui.sb.style.display = "block";

    console.log("[app] rendering embed to #sbAppContainer");
    embed.render("#sbAppContainer");

    console.log("[app] Superblocks embed loaded successfully!");
  } catch (e) {
    console.error("[app] error loading Superblocks embed:", e);
    ui.statusText.textContent = "Failed to load application";
    showErr(`Application load error: ${e.message || e}`);

    // Keep the status card visible so user can try logout/login
    ui.statusCard.style.display = "block";
    ui.sb.style.display = "none";
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
