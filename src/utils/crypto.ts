import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// Funzione per generare una chiave casuale
export const generateKey = async (length: number = 32): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Funzione per generare un salt casuale
export const generateSalt = async (length: number = 16): Promise<string> => {
  return generateKey(length);
};

// Funzione per hashare una password con salt
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const data = password + salt;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
  return digest;
};

// Funzione per verificare una password
export const verifyPassword = async (
  password: string,
  salt: string,
  hashedPassword: string
): Promise<boolean> => {
  const hash = await hashPassword(password, salt);
  return hash === hashedPassword;
};

// Funzione per generare una chiave di crittografia per i messaggi
export const generateMessageKey = async (): Promise<string> => {
  return generateKey(32);
};

// Funzione per generare un ID univoco
export const generateUniqueId = async (): Promise<string> => {
  const timestamp = Date.now().toString(36);
  const randomStr = (await generateKey(8)).slice(0, 8);
  return `${timestamp}-${randomStr}`;
};

// Funzione per generare un nonce (numero utilizzato una sola volta)
export const generateNonce = async (length: number = 12): Promise<string> => {
  return generateKey(length);
};

// Funzione per generare un token di sicurezza
export const generateSecurityToken = async (): Promise<string> => {
  return generateKey(48);
};

// Funzione per generare un codice di verifica
export const generateVerificationCode = async (length: number = 6): Promise<string> => {
  const bytes = await Crypto.getRandomBytesAsync(length);
  const numbers = Array.from(bytes).map(b => Math.abs(b) % 10);
  return numbers.join('');
};

// Funzione per generare una chiave di backup
export const generateBackupKey = async (): Promise<string> => {
  const key = await generateKey(32);
  // Formatta la chiave in gruppi di 4 caratteri per maggiore leggibilità
  return key.match(/.{1,4}/g)?.join('-') || key;
};

// Funzione per validare una chiave di backup
export const validateBackupKey = (key: string): boolean => {
  const cleanKey = key.replace(/-/g, '');
  return /^[0-9a-f]{64}$/i.test(cleanKey);
};

// Funzione per generare un fingerprint del dispositivo
export const generateDeviceFingerprint = async (): Promise<string> => {
  const platform = Platform.OS;
  const timestamp = Date.now();
  const random = await generateKey(16);
  return `${platform}-${timestamp}-${random}`;
};
