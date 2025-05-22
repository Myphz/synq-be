import { app } from "./app.js";
import {
  onMessage,
  onNewConnection,
  onSubscriptionChange,
  onUpgradeRequest
} from "./wss/events.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

app.ws("/", {
  upgrade: onUpgradeRequest,
  open: onNewConnection,
  message: onMessage,
  subscription: onSubscriptionChange,
  // @ts-expect-error its ok
  close: (ws) => (ws.isClosed = true)
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
