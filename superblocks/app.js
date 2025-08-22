// App.js
const { useState, useEffect } = React;
const { Auth0Provider, useAuth0 } = Auth0React;
const { SuperblocksEmbed } = SuperblocksEmbedReact;

// Your Auth0 configuration
const AUTH0_DOMAIN = "dev-ajpiv5ho3pze4hxh.us.auth0.com"; // Replace with your Auth0 domain
const AUTH0_CLIENT_ID = "WEWimGffakZxFFcDVXuiqtCGAKl85zrO"; // Replace with your Auth0 client ID

const PageWithEmbed = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated && user) {
        try {
          // Get the access token or use the superblocks_token from user metadata
          const accessToken = await getAccessTokenSilently();
          setToken(user.superblocks_token || accessToken);
        } catch (error) {
          console.error("Error getting token:", error);
        }
      }
    };

    getToken();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated && user && (user.superblocks_token || token) ? (
        <SuperblocksEmbed
          src="https://app.superblocks.com/embed/applications/6e427632-7ba5-45b4-acfb-d83b48cc71c4"
          token={user.superblocks_token || token}
        />
      ) : isAuthenticated ? (
        <div>User authenticated but no Superblocks token available</div>
      ) : (
        <div>User not authenticated</div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <div className="App">
        <PageWithEmbed />
      </div>
    </Auth0Provider>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
