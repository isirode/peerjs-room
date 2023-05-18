
// TODO : replace it by own code
// Modification of the code there https://github.com/peers/peerjs/blob/master/lib/api.ts
// MIT license 
export class ForkedApi {
  protected readonly _options: any

  constructor (_options: any) {
    this._options = _options
    if (this._options.path === undefined) {
      this._options.path = '/'
    }
    if (this._options.key === undefined) {
      this._options.key = 'peerjs'
    }
  }

  protected _buildUrl (method: string): string {
    const protocol = this._options.secure ? 'https://' : 'http://'
    let url =
      protocol +
      this._options.host +
      ':' +
      this._options.port +
      this._options.path +
      this._options.key +
      '/' +
      method
    const queryString = '?ts=' + new Date().getTime() + '' + Math.random()
    url += queryString

    return url
  }

  /** Get a unique ID from the server via XHR and initialize with it. */
  async retrieveId (): Promise<string> {
    const url = this._buildUrl('id')

    try {
      const response = await fetch(url)

      if (response.status !== 200) {
        throw new Error(`Error. Status:${response.status}`)
      }

      return response.text()
    } catch (error) {
      console.error('Error retrieving ID', error)

      let pathError = ''

      if (
        this._options.path === '/'
      ) {
        pathError =
          ' If you passed in a `path` to your self-hosted PeerServer, ' +
          'you\'ll also need to pass in that same path when creating a new ' +
          'Peer.'
      }

      throw new Error('Could not get an ID from the server.' + pathError)
    }
  }
}
