function getSBToken() {
  return fetch(`https://${YOUR_API_DOMAIN}/api/superblocks/token`)
    .then((res) => res.json())
    .then((data) => data.access_token)
    .catch((err) => {
      throw new Error("Superblocks Auth Error");
    });
}
