import app from "./app";
import { createServer } from "http";

const server = createServer(app);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${process.env.PORT}`);
});
