import { useUser as useClerkUser } from "@clerk/clerk-react";

interface AppUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  phoneNumber?: string | null;
}

export const useUser = () => {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  
  return {
    user: isSignedIn ? {
      id: user?.id || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      imageUrl: user?.imageUrl || '',
      phoneNumber: user?.phoneNumbers?.[0]?.phoneNumber || null
    } : null,
    isSignedIn,
    isLoaded
  } as { user: AppUser | null; isSignedIn: boolean; isLoaded: boolean };
};