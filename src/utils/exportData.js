import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportTransactionsToCSV(transactions, currencySymbol = '$') {
  if (!transactions || transactions.length === 0) {
    Alert.alert('No Transactions', 'There are no transactions to export.');
    return false;
  }

  // Header row
  const headers = ['ID', 'Date', 'Type', 'Category', 'Title', `Amount (${currencySymbol})`, 'Recurring', 'Notes'];
  
  // Data rows
  const rows = transactions.map((t) => {
    const escapedTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
    const escapedNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
    return [
      t.id,
      t.date,
      t.type,
      t.category,
      escapedTitle,
      t.amount.toFixed(2),
      t.isRecurring ? 'Yes' : 'No',
      escapedNotes,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  if (Platform.OS === 'web') {
    // Web download trigger
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ExpenseTracker_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.error('Web CSV export failed:', e);
      Alert.alert('Export Error', 'Failed to generate CSV download.');
      return false;
    }
  }

  // Mobile (iOS/Android)
  try {
    const filename = `ExpenseTracker_${Date.now()}.csv`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Transactions CSV',
        UTI: 'public.comma-separated-values-text',
      });
      return true;
    } else {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      return false;
    }
  } catch (error) {
    console.error('Mobile CSV export failed:', error);
    Alert.alert('Export Failed', 'An error occurred while exporting transactions.');
    return false;
  }
}
