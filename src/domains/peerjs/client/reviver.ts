// Credit to Pawel : https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
// License CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/
export function reviver (_: string, value: any) { // key
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      console.log('deserializing map')
      return new Map(value.value)
    }
  }
  return value
}
