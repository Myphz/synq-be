import { app } from "./app.js";
import {
  onConnectionClose,
  onMessage,
  onNewConnection,
  onUpgradeRequest
} from "./wss/handlers.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

app.ws("/", {
  upgrade: onUpgradeRequest,
  open: onNewConnection,
  message: onMessage,
  close: onConnectionClose
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
