import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F'
];

const generateInitials = (displayName: string): string => {
  if (!displayName) return '?';
  const names = displayName.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const generateSVG = (initials: string, backgroundColor: string): string => {
  return `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${backgroundColor}"/>
      <text
        x="100"
        y="100"
        font-family="Arial, sans-serif"
        font-size="80"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >${initials}</text>
    </svg>
  `;
};

export const generateAvatar = async (userId: string, displayName: string): Promise<string> => {
  try {
    const initials = generateInitials(displayName);
    const backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const svg = generateSVG(initials, backgroundColor);
    
    // Converti SVG in Blob
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    
    // Carica su Firebase Storage
    const avatarRef = ref(storage, `generated_avatars/${userId}.svg`);
    const metadata = {
      contentType: 'image/svg+xml',
      userId: userId
    };
    
    await uploadBytes(avatarRef, blob, metadata);
    const photoURL = await getDownloadURL(avatarRef);
    
    return photoURL;
  } catch (error) {
    console.error('Error generating avatar:', error);
    throw error;
  }
};
