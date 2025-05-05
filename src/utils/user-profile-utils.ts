/**
 * Utility functions for user profile management
 */

interface UserProfile {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  walletAddress?: string | null;
  accountType?: "USER" | "TAILOR" | null;
}

/**
 * Check if a user profile has all required fields
 * @param profile The user profile to check
 * @returns boolean indicating if the profile is complete
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  return !!(
    profile && 
    profile.firstName && 
    profile.lastName && 
    (profile.email || profile.phone) &&
    profile.accountType // Ensure account type is set
  );
}

/**
 * Debug helper to log the current user profile status
 * @param profile The user profile to check
 * @returns Object with status information
 */
export function debugProfileStatus(profile: UserProfile | null): object {
  if (!profile) {
    return { status: 'missing', message: 'No user profile found' };
  }
  
  const missingFields = [];
  
  if (!profile.firstName) missingFields.push('firstName');
  if (!profile.lastName) missingFields.push('lastName');
  if (!profile.email && !profile.phone) missingFields.push('email/phone');
  if (!profile.accountType) missingFields.push('accountType');
  
  const isComplete = missingFields.length === 0;
  
  return {
    status: isComplete ? 'complete' : 'incomplete',
    missingFields: missingFields.length > 0 ? missingFields : [],
    profile: {
      id: profile.id,
      hasFirstName: !!profile.firstName,
      hasLastName: !!profile.lastName,
      hasEmail: !!profile.email,
      hasPhone: !!profile.phone,
      hasWallet: !!profile.walletAddress,
      accountType: profile.accountType || 'not set'
    }
  };
}

/**
 * Clear user profile data from local storage
 * Useful for testing and debugging
 */
export function clearProfileData(): void {
  localStorage.removeItem('auth_user');
  console.log('User profile data cleared from localStorage');
} 