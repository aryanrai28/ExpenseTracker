import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Collect all app data for backup.
 */
async function collectAllData() {
  const data = {};
  for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw !== null) {
        data[key] = JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Failed to read ${storageKey}:`, e);
    }
  }
  data._backupVersion = 3;
  data._backupDate = new Date().toISOString();
  return data;
}

/**
 * Simple XOR-based obfuscation with password.
 * Not cryptographically secure but provides basic protection.
 * For production, use expo-crypto AES.
 */
function obfuscate(text, password) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ password.charCodeAt(i % password.length)
    );
  }
  // Base64 encode to make it safe for file storage
  return btoa(unescape(encodeURIComponent(result)));
}

function deobfuscate(encoded, password) {
  const text = decodeURIComponent(escape(atob(encoded)));
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ password.charCodeAt(i % password.length)
    );
  }
  return result;
}

/**
 * Export an encrypted backup file.
 */
export async function exportEncryptedBackup(password) {
  if (!password || password.length < 4) {
    Alert.alert('Weak Password', 'Please use a password with at least 4 characters.');
    return false;
  }

  try {
    const data = await collectAllData();
    const json = JSON.stringify(data);
    const encrypted = obfuscate(json, password);

    const payload = JSON.stringify({
      _format: 'expense_tracker_backup',
      _version: 3,
      data: encrypted,
    });

    if (Platform.OS === 'web') {
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ExpenseTracker_Backup_${new Date().toISOString().slice(0, 10)}.etbak`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // Mobile
    const filename = `ExpenseTracker_Backup_${Date.now()}.etbak`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, payload, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Encrypted Backup',
      });
      return true;
    } else {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      return false;
    }
  } catch (error) {
    console.error('Backup export failed:', error);
    Alert.alert('Export Failed', 'An error occurred while creating the backup.');
    return false;
  }
}

/**
 * Import an encrypted backup from a JSON string.
 */
export async function importEncryptedBackup(backupJson, password) {
  if (!password) {
    Alert.alert('Password Required', 'Please enter the backup password.');
    return false;
  }

  try {
    const wrapper = JSON.parse(backupJson);
    if (wrapper._format !== 'expense_tracker_backup') {
      Alert.alert('Invalid File', 'This does not appear to be a valid backup file.');
      return false;
    }

    const decrypted = deobfuscate(wrapper.data, password);
    const data = JSON.parse(decrypted);

    if (!data._backupVersion) {
      Alert.alert('Invalid Backup', 'The backup data is corrupted or the password is incorrect.');
      return false;
    }

    // Write all data to AsyncStorage
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      if (data[key] !== undefined) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(data[key]));
      }
    }

    Alert.alert('Import Successful', 'Your data has been restored. Please restart the app to see changes.');
    return true;
  } catch (error) {
    console.error('Backup import failed:', error);
    Alert.alert('Import Failed', 'Wrong password or corrupted backup file.');
    return false;
  }
}
