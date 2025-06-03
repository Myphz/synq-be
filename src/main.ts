import firebase from "firebase-admin";
import { cert } from "firebase-admin/app";
import { app } from "./app.js";
import { FIREBASE_SERVICE_ACCOUNT } from "./constants.js";
import {
  onConnectionClose,
  onMessage,
  onNewConnection,
  onUpgradeRequest
} from "./server/handlers.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

firebase.initializeApp({
  credential: cert(FIREBASE_SERVICE_ACCOUNT)
});

app.ws("/", {
  upgrade: onUpgradeRequest,
  open: onNewConnection,
  message: onMessage,
  close: onConnectionClose,
  idleTimeout: 8
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
