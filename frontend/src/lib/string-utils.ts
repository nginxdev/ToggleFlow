/**
 * Converts a string to camelCase
 * @param str - The string to convert
 * @returns The camelCase version of the string
 * @example
 * toCamelCase("My Awesome Project") // "myAwesomeProject"
 * toCamelCase("Test Environment") // "testEnvironment"
 */
export function toCamelCase(str: string): string {
  return str
    .split(/\s+/)
    .map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '')
      if (index === 0) {
        return cleanWord.toLowerCase()
      }
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
    })
    .join('')
}
