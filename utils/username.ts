/**
 * Check if a username is valid according to our rules
 */
export function isValidUsername(username: string): boolean {
  if (!username) return false;
  
  const regex = /^[a-z0-9_]+$/;
  return (
    regex.test(username) &&
    username.length >= 3 &&
    username.length <= 20 &&
    !username.startsWith('_') &&
    !username.endsWith('_')
  );
} 