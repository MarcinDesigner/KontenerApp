import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Komponent przycisków filtrowania, który będzie używany na wszystkich ekranach
const FilterButtons = ({ activeFilter, onFilterChange }) => {
  return (
    <View style={styles.filterButtons}>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          activeFilter === 'all' ? styles.activeFilterButton : null
        ]}
        onPress={() => onFilterChange('all')}
      >
        <Text 
          style={activeFilter === 'all' ? styles.activeFilterText : styles.filterText}
        >
          Wszystkie
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          activeFilter === 'import' ? styles.activeFilterButton : null
        ]}
        onPress={() => onFilterChange('import')}
      >
        <Text 
          style={activeFilter === 'import' ? styles.activeFilterText : styles.filterText}
        >
          Import
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          activeFilter === 'export' ? styles.activeFilterButton : null
        ]}
        onPress={() => onFilterChange('export')}
      >
        <Text 
          style={activeFilter === 'export' ? styles.activeFilterText : styles.filterText}
        >
          Export
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#E3F2FD',
  },
  filterText: {
    color: '#757575',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default FilterButtons;