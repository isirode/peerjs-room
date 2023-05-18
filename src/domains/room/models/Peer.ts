import { Peer as peerjs_Peer } from 'peerjs'

export interface IPeer {
  id: string
}

// Info : connection of PeerJS has a string peer property
export class Peer implements IPeer {
  base: peerjs_Peer

  get id(): string {
    return this.base.id
  }

  constructor(base: peerjs_Peer) {
    this.base = base
  }
}
