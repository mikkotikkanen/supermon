import { join } from "path";
import { homedir } from "os";

const GetPath = () => {
  return join(homedir(), '.nodewatcher');
}

export default GetPath;
