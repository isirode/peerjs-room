// import Peer from 'peerjs'
import { DataConnection } from 'peerjs'

export interface IConnection {
  peer: string;
}

// TODO : implement a complete interface so that PeerJS is used as least as possible
export class Connection implements IConnection {// We need this to avoid circular references

  // FIXME : expore this more properly ?
  public _connection: DataConnection;

  constructor(connection: DataConnection) {
    this._connection = connection;
  }

  public get peer(): string {
    return this._connection.peer;
  }

  public send(data: any) {
    this._connection.send(data);
  }

  public close() {
    this._connection.close();
  }
}
