import uWS from "uWebSockets.js";
import { getSupabaseUser, getSupabaseUserClient } from "./middlewares/auth.js";
import { enhanceRequest } from "./utils/enhance.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const app = uWS.App();

app.ws("/", {
  upgrade: async (res, req, ctx) => {
    enhanceRequest(res, req);
    const user = await getSupabaseUser(res);
    const client = await getSupabaseUserClient(res);

    res.cork(() => {
      res.upgrade(
        { user, client },
        res.reqHeaders["sec-websocket-key"],
        res.reqHeaders["sec-websocket-protocol"],
        res.reqHeaders["sec-websocket-extensions"],
        ctx!
      );
    });
  },
  open: (ws) => {
    console.log("connected");
    ws.subscribe("broadcast");
  },
  message: (ws) => {
    console.log("rec");
    app.publish("broadcast", "ooo", false);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
