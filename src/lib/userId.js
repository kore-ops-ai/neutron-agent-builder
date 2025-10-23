/**
 * Generate and persist a unique user ID per browser
 * Each browser gets its own isolated user ID
 */
export function getBrowserUserId() {
  const STORAGE_KEY = 'neutron_user_id';

  // Check if user ID already exists in localStorage
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    // Generate a new unique ID for this browser
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
    console.log('[userId] Generated new browser user ID:', userId);
  } else {
    console.log('[userId] Using existing browser user ID:', userId);
  }

  return userId;
}
