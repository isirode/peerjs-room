import Emittery from "emittery";
import { DataConnection } from "peerjs";
import { User } from "../room/models/User";

export interface Events<T> {
  open: { user: User | undefined, connection: DataConnection};
  data: { data: T, user: User | undefined, connection: DataConnection};
  close: { user: User | undefined, connection: DataConnection};
  error: { error: Error, user: User | undefined, connection: DataConnection};
  closeChannel: undefined;
}

export interface IChannel<T> {
  events: Emittery<Events<T>>;
  broadcast(data: T);
  broadcastToUsers(data: T, users: User[]);
  broadcastToConnections(data: T, connections: DataConnection[]);
  send(data: T, user: User);
  // TODO : implement the one for a single connection ?
  // Is this necessary ?
}
