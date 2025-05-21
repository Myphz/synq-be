import { app } from "./app.js";
import { onMessage, onNewConnection, onUpgradeRequest } from "./wss/events.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

app.ws("/", {
  upgrade: onUpgradeRequest,
  open: onNewConnection,
  message: onMessage
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
