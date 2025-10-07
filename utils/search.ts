/**
 * Creates an accent-insensitive regex pattern for database searches
 * Converts "medellin" to match "Medellín", "sao paulo" to match "São Paulo", etc.
 * 
 * @param searchTerm - The user's search input
 * @returns A regex pattern string that matches with or without accents
 * 
 * @example
 * createAccentInsensitivePattern("medellin") 
 * // Returns: "m[eèéêë]d[eèéêë]ll[iìíîï]n"
 */
export function createAccentInsensitivePattern(searchTerm: string): string {
  return searchTerm
    .replace(/a/gi, "[aàáâãäå]")
    .replace(/e/gi, "[eèéêë]")
    .replace(/i/gi, "[iìíîï]")
    .replace(/o/gi, "[oòóôõö]")
    .replace(/u/gi, "[uùúûü]")
    .replace(/n/gi, "[nñ]")
    .replace(/c/gi, "[cç]")
    .replace(/s/gi, "[sš]")
    .replace(/z/gi, "[zž]");
}

/**
 * Escapes special regex characters in a string
 * Useful for preventing regex injection in user input
 * 
 * @param str - The string to escape
 * @returns The escaped string safe for use in regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

