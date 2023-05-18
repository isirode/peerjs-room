import { IRoom } from "../../room/models/Room";
import { ForkedApi } from "./adapters/ForkedApi"
import { reviver } from './reviver';

export class PeerJSServerClient extends ForkedApi {

  constructor (_options: any) {
    super(_options);
  }

  async isConnected (peerId: string): Promise<string> {
    const url = this._buildUrl('peer/' + peerId + '/connected');

    try {
      // TODO : use no-cache every where
      const response = await fetch(url, {
        cache: 'no-store', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      })

      if (response.status !== 200) {
        if (response.status === 401) {
          throw new Error('An error occurred while verifying if the peer is connected.')
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      return response.text()
    } catch (error) {
      console.error('An unexpected error occurred', error)

      throw error;
    }
  }

  // Modification of the code there https://github.com/peers/peerjs/blob/master/lib/api.ts
  // MIT license 
  // To support rooms
  async listAllPeers (roomId?: string): Promise<any[]> {
    let url = ''
    if (typeof (roomId) === 'undefined' || roomId === '') {
      url = this._buildUrl('peers')
    } else {
      url = this._buildUrl('peers/' + roomId)
    }

    try {
      const response = await fetch(url)

      if (response.status !== 200) {
        if (response.status === 401) {
          let helpfulError = ''

          helpfulError =
              'You need to enable `allow_discovery` on your self-hosted ' +
              'PeerServer to use this feature.'

          throw new Error('It doesn\'t look like you have permission to list peers IDs. ' +
            helpfulError)
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      return response.json()
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getRooms (): Promise<Map<string, IRoom>> {
    const url = this._buildUrl('rooms')

    try {
      const response = await fetch(url)

      if (response.status !== 200) {
        if (response.status === 401) {
          // TODO : check this
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      const roomsAsString = await response.text();

      const rooms = JSON.parse(roomsAsString, reviver) as Map<string, IRoom>;

      return rooms;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getRoom (roomId: string): Promise<IRoom> {
    const url = this._buildUrl('room/' + roomId)

    try {
      const response = await fetch(url)

      if (response.status !== 200) {
        if (response.status === 401) {
          // TODO : check this
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      const roomAsString = await response.text();

      const room = JSON.parse(roomAsString, reviver) as IRoom;

      return room;
    } catch (error) {
      console.error(error)

      throw error;
    }
  }

  // TODO : replace any by an interface
  async createRoom (room: any): Promise<string> {
    const url = this._buildUrl('room');

    try {
      const jsonBody = JSON.stringify(room)
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: jsonBody
      }
      const response = await fetch(url, fetchOptions)

      if (response.status !== 200) {
        if (response.status === 401) {
          // TODO : check this
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      return response.text()
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async joinRoom (roomId: string, peerId: string): Promise<string> {
    const url = this._buildUrl('room/' + roomId + '/join')

    try {
      const jsonBody = JSON.stringify({
        peerId: peerId
      })
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: jsonBody
      }
      const response = await fetch(url, fetchOptions)

      if (response.status !== 200) {
        if (response.status === 401) {
          // TODO : check this
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      return response.text();
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async leaveRoom (roomId: string, peerId: string): Promise<string> {
    const url = this._buildUrl('room/' + roomId + '/leave')

    try {
      const jsonBody = JSON.stringify({
        peerId: peerId
      })
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: jsonBody
      }
      const response = await fetch(url, fetchOptions)

      if (response.status !== 200) {
        if (response.status === 401) {
          // TODO : check this
        }

        throw new Error(`HTTP error (status code: ${response.status})`);
      }

      return response.text()
    } catch (error) {
      console.error(error)

      throw error;
    }
  }
}
