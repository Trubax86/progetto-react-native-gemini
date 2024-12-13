import { useAuth } from './useAuth';

export const useUserAvatar = () => {
  const { currentUser } = useAuth();

  const getAvatarProps = (size = 35) => ({
    size,
    userId: currentUser?.uid,
    photoURL: currentUser?.photoURL,
    displayName: currentUser?.displayName,
    showStatus: false,
  });

  return { getAvatarProps };
};
