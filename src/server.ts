import server from "./app";
import { PORT as CPORT } from "./lib/consts";

const PORT = CPORT || 5000;

server.listen(PORT, () => {
  console.log(process.env, "ENV");
  console.log(`listening on http://localhost:${PORT}`);
});
