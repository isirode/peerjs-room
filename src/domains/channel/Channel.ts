import Emittery from "emittery";
import { Events, IChannel } from "./IChannel";
import { DataConnection } from "peerjs";
import { User } from "../room/models/User";
import { IServer, Response } from "peerjs-request-response";
import { Message } from "../room/models/Message";

export class Channel<ChannelMessageType, FetchRequestBodyType, FetchResponseBodyType> implements IChannel<ChannelMessageType, FetchRequestBodyType, FetchResponseBodyType> {

  events: Emittery<Events<ChannelMessageType>> = new Emittery();

  name: string;
  channelResponseName: string;

  protected _broadcast: (data: ChannelMessageType) => void;
  protected _broadcastToUsers: (data: ChannelMessageType, users: User[]) => void;
  protected _broadcastToConnections: (data: ChannelMessageType, connections: DataConnection[]) => void;
  protected _send: (data: ChannelMessageType, user: User) => void;
  protected _fetch: (data: FetchRequestBodyType, user: User) => Promise<Response<FetchResponseBodyType>>;
  protected _fetchFromUsers: (data: FetchRequestBodyType, users: User[]) => Promise<Response<FetchResponseBodyType>[]>;
  protected _fetchFromAllUsers: (data: FetchRequestBodyType) => Promise<Response<FetchResponseBodyType>[]>;

  server: IServer<Message, FetchRequestBodyType, FetchResponseBodyType>;

  constructor(
    name: string,
    _broadcast: (data: ChannelMessageType) => void,
    _broadcastToUsers: (data: ChannelMessageType, users: User[]) => void,
    _broadcastToConnections: (data: ChannelMessageType, connections: DataConnection[]) => void,
    _send: (data: ChannelMessageType, user: User) => void,
    _fetch: (data: FetchRequestBodyType, user: User) => Promise<Response<FetchResponseBodyType>>,
    _fetchFromUsers: (data: FetchRequestBodyType, users: User[]) => Promise<Response<FetchResponseBodyType>[]>,
    _fetchFromAllUsers: (data: FetchRequestBodyType) => Promise<Response<FetchResponseBodyType>[]>,
    server: IServer<Message, FetchRequestBodyType, FetchResponseBodyType>
  ) {
    this.name = name;
    this.channelResponseName = name + '-response';
    this._broadcast = _broadcast;
    this._broadcastToUsers = _broadcastToUsers;
    this._broadcastToConnections = _broadcastToConnections;
    this._send = _send;
    this._fetch = _fetch;
    this._fetchFromUsers = _fetchFromUsers;
    this._fetchFromAllUsers = _fetchFromAllUsers;
    this.server = server;
  }

  broadcast(data: ChannelMessageType) {
    this._broadcast(data);
  }

  broadcastToUsers(data: ChannelMessageType, users: User[]) {
    this._broadcastToUsers(data, users);
  }

  broadcastToConnections(data: ChannelMessageType, connections: DataConnection[]) {
    this._broadcastToConnections(data, connections);
  }

  send(data: ChannelMessageType, user: User) {
    this._send(data, user);
  }

  fetch(data: FetchRequestBodyType, user: User): Promise<Response<FetchResponseBodyType>> {
    return this._fetch(data, user);
  }

  fetchFromUsers(data: FetchRequestBodyType, users: User[]): Promise<Response<FetchResponseBodyType>[]> {
    return this._fetchFromUsers(data, users);
  }

  fetchFromAllUsers(data: FetchRequestBodyType): Promise<Response<FetchResponseBodyType>[]> {
    return this._fetchFromAllUsers(data);
  }
}