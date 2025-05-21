import uWS from "uWebSockets.js";
import { withAuth } from "./middlewares/auth.js";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const app = uWS.App();

app.ws("/", {
  upgrade: withAuth((res, req, ctx) => {
    console.log(res);

    res.upgrade(
      { uid: res.user._id },
      req.getHeader("sec-websocket-key"),
      req.getHeader("sec-websocket-protocol"),
      req.getHeader("sec-websocket-extensions"),
      ctx
    );
  }),

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
