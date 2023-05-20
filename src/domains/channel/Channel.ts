import Emittery, { OmnipresentEventData, DatalessEventNames } from "emittery";
import { Events, IChannel } from "./IChannel";
import { DataConnection } from "peerjs";
import { User } from "../room/models/User";

export class Channel<T> implements IChannel<T> {

  events: Emittery<Events<T>> = new Emittery();

  name: string;

  protected _broadcast: (data: T) => void;
  protected _broadcastToUsers: (data: T, users: User[]) => void;
  protected _broadcastToConnections: (data: T, connections: DataConnection[]) => void;
  protected _send: (data: T, user: User) => void;

  constructor(
    name: string,
    _broadcast: (data: T) => void,
    _broadcastToUsers: (data: T, users: User[]) => void,
    _broadcastToConnections: (data: T, connections: DataConnection[]) => void,
    _send: (data: T, user: User) => void
  ) {
    this.name = name;
    this._broadcast = _broadcast;
    this._broadcastToUsers = _broadcastToUsers;
    this._broadcastToConnections = _broadcastToConnections;
    this._send = _send;
  }

  broadcast(data: T) {
    this._broadcast(data);
  }

  broadcastToUsers(data: T, users: User[]) {
    this._broadcastToUsers(data, users);
  }

  broadcastToConnections(data: T, connections: DataConnection[]) {
    this._broadcastToConnections(data, connections);
  }

  send(data: T, user: User) {
    this._send(data, user);
  }

}