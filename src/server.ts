import server from "./app";
import { PORT as PORTC, HOST as HOSTC } from "./lib/consts";

const PORT = PORTC || 5000;
const HOST = HOSTC || "localhost";

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
