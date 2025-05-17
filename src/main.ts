import uWS from "uWebSockets.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const app = uWS.App();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
