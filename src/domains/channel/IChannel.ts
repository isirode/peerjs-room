import Emittery from "emittery";
import { DataConnection } from "peerjs";
import { User } from "../room/models/User";
import { IServer, Response } from 'peerjs-request-response';

// FIXME : we should use <T, U>
export interface Events<T> {
  open: { user: User | undefined, connection: DataConnection};
  data: { data: T, user: User | undefined, connection: DataConnection};
  close: { user: User | undefined, connection: DataConnection};
  error: { error: Error, user: User | undefined, connection: DataConnection};
  closeChannel: undefined;
}

export interface IChannel<ChannelMessageType, FetchRequestBodyType, FetchResponseBodyType> {
  name: string;
  channelResponseName;
  server: IServer;
  events: Emittery<Events<ChannelMessageType>>;
  broadcast(data: ChannelMessageType);
  broadcastToUsers(data: ChannelMessageType, users: User[]);
  broadcastToConnections(data: ChannelMessageType, connections: DataConnection[]);
  send(data: ChannelMessageType, user: User);
  // TODO : implement the one for a single connection ?
  // Is this necessary ?
  fetch(data: FetchRequestBodyType, user: User): Promise<Response<FetchResponseBodyType>>;
  fetchFromUsers(data: FetchRequestBodyType, users: User[]): Promise<Response<FetchResponseBodyType>[]>;
  fetchFromAllUsers(data: FetchRequestBodyType): Promise<Response<FetchResponseBodyType>[]>;
  // TODO : implement a respond system
  // respond(data: U, user: User);

  // TODO : support other types of fetch
  // Like, emitting an event when a data is received
  // One that returns an array of Promises
}
