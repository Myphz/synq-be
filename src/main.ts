import uWS from "uWebSockets.js";
import { onNewConnection, onUpgradeRequest } from "./wss/events.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const app = uWS.App();

app.ws("/", {
  upgrade: onUpgradeRequest,
  open: onNewConnection,
  message: (ws) => {
    console.log("rec");
    app.publish("broadcast", "ooo", false);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
