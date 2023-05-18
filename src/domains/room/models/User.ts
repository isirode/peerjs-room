import { IPeer, Peer } from "./Peer";

export interface User {
  peer: IPeer;
  name: string;
}

// FIXME : did not find any good way to implement it
export interface LocalUser extends User {
  peer: Peer;
  name: string;
}