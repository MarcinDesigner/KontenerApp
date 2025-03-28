import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SearchHistoryItem = ({ item, onPress, onRemove }) => {
  // Określenie typu (import/export)
  const isImport = item.filter === 'import';
  const isExport = item.filter === 'export';
  
  // Formatowanie czasu wyszukiwania
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        return 'przed chwilą';
      } else if (diffHours === 1) {
        return '1 godz. temu';
      } else if (diffHours < 24) {
        return `${diffHours} godz. temu`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) {
          return 'wczoraj';
        } else {
          return `${diffDays} dni temu`;
        }
      }
    } catch (e) {
      return '';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="history" size={22} color="#757575" />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.queryText}>{item.query}</Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.timestampText}>{formatTimestamp(item.timestamp)}</Text>
          
          {(isImport || isExport) && (
            <View style={[
              styles.filterBadge,
              isImport ? styles.importBadge : styles.exportBadge
            ]}>
              <Text style={[
                styles.filterText,
                isImport ? styles.importText : styles.exportText
              ]}>
                {isImport ? 'Import' : 'Export'}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <MaterialIcons name="close" size={20} color="#BDBDBD" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  iconContainer: {
    padding: 8,
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#757575',
    marginRight: 8,
  },
  filterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100, // Pełne zaokrąglenie
  },
  importBadge: {
    backgroundColor: '#FFF2E5',
  },
  exportBadge: {
    backgroundColor: '#FEE9E9',
  },
  filterText: {
    fontSize: 10,
    fontWeight: '500',
  },
  importText: {
    color: '#F39C12',
  },
  exportText: {
    color: '#E74C3C',
  },
  removeButton: {
    padding: 8,
  },
});

export default SearchHistoryItem;