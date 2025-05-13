import { useUser as useClerkUser } from "@clerk/clerk-react";

export const useUser = () => {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  
  return {
    user: isSignedIn ? {
      id: user?.id || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      imageUrl: user?.imageUrl || ''
    } : null,
    isSignedIn,
    isLoaded
  };
};