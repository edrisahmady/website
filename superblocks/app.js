// Auth0 configuration
const auth0Config = {
  domain: "dev-ajpiv5ho3pze4hxh.us.auth0.com", // Replace with your Auth0 domain (e.g., 'yourapp.us.auth0.com')
  clientId: "WEWimGffakZxFFcDVXuiqtCGAKl85zrO", // Replace with your Auth0 client ID
  redirectUri: window.location.origin + "/superblocks/", // or just window.location.origin
  audience: "YOUR_API_IDENTIFIER", // Replace with your Auth0 API identifier (optional)
};

// Initialize Auth00
let auth0Client;

// Initialize Auth0 client
async function initAuth0() {
  auth0Client = await auth0.createAuth0Client({
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    authorizationParams: {
      redirect_uri: auth0Config.redirectUri,
      audience: auth0Config.audience, // Optional - only if you have an API configured
    },
  });

  // Check if user is returning from Auth0 redirect
  if (
    window.location.search.includes("code=") &&
    window.location.search.includes("state=")
  ) {
    try {
      await auth0Client.handleRedirectCallback();
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error handling Auth0 callback:", error);
    }
  }
}

// Check if user is authenticated
async function isAuthenticated() {
  return await auth0Client.isAuthenticated();
}

// Get access token for API calls
async function getAccessToken() {
  try {
    const token = await auth0Client.getTokenSilently();
    return token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

// Login function
async function login() {
  await auth0Client.loginWithRedirect();
}

// Logout function
async function logout() {
  await auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
}

// Function to get Superblocks authentication token
async function getSBToken() {
  try {
    // Get Auth0 access token
    const accessToken = await getAccessToken();

    // Update this URL based on where your backend is deployed
    const backendUrl = "http://localhost:3001"; // Change this when you deploy

    const response = await fetch(`${backendUrl}/api/superblocks/token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Superblocks token:", error);
    throw new Error("Superblocks Auth Error: " + error.message);
  }
}

// Function to initialize Superblocks embed
async function initializeSuperblocks() {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      console.log("User not authenticated, redirecting to login...");
      await login();
      return;
    }

    // Show loading indicator
    showLoading("Loading Superblocks application...");

    // Get authentication token
    const token = await getSBToken();

    // Create Superblocks embed with authentication
    const sbApp = Superblocks.createSuperblocksEmbed({
      id: "sb-app",
      src: "https://app.superblocks.com/embed/applications/6e427632-7ba5-45b4-acfb-d83b48cc71c4",
      token: token,
      // Uncomment and modify the properties below if needed
      // properties: { EmbedProp1: "Hello World" }
    });

    // Hide loading indicator
    hideLoading();

    // Append to document body
    document.body.appendChild(sbApp);

    console.log("Superblocks embed initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Superblocks embed:", error);
    hideLoading();

    // Show error message with retry option
    showError("Failed to load application. Please try again.", () => {
      window.location.reload();
    });
  }
}

// Helper functions for UI feedback
function showLoading(message = "Loading...") {
  const existing = document.getElementById("loading-message");
  if (existing) {
    existing.textContent = message;
    existing.style.display = "flex";
    return;
  }

  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-message";
  loadingDiv.textContent = message;
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    color: #666;
    z-index: 9999;
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loading = document.getElementById("loading-message");
  if (loading) {
    loading.style.display = "none";
  }
}

function showError(message, retryCallback) {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    color: #666;
    z-index: 9999;
  `;

  errorDiv.innerHTML = `
    <div style="text-align: center; max-width: 400px;">
      <p style="color: #d32f2f; margin-bottom: 20px;">${message}</p>
      <button id="retry-btn" style="
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin-right: 10px;
      ">Retry</button>
      <button id="logout-btn" style="
        background: #666;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      ">Logout</button>
    </div>
  `;

  document.body.appendChild(errorDiv);

  // Add event listeners
  document.getElementById("retry-btn").addEventListener("click", retryCallback);
  document.getElementById("logout-btn").addEventListener("click", logout);
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initAuth0();
    await initializeSuperblocks();
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to initialize application.", () => {
      window.location.reload();
    });
  }
});
