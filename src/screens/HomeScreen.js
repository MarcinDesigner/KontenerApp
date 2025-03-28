import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Funkcja do obsługi wyszukiwania
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Gdy mamy zapytanie, przejdź do ekranu wyników z parametrami wyszukiwania
      navigation.navigate('ContainerList', { 
        query: searchQuery,
        filter: activeFilter
      });
    }
  };
  
  // Funkcja obsługująca zmianę filtra
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje kontenery</Text>
      </View>
      
      {/* Komponent wyszukiwarki */}
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      
      {/* Komponent przycisków filtrów */}
      <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      
      {/* Stan pusty */}
      <View style={styles.emptyStateContainer}>
        <MaterialIcons name="inventory-2" size={100} color="#E0E0E0" style={styles.emptyStateIcon} />
        <Text style={styles.emptyStateText}>
          Wyszukaj pierwszy kontener!
        </Text>
        
        {/* Wskazówki wyszukiwania */}
        <View style={styles.tipContainer}>
          <MaterialIcons name="info-outline" size={20} color="#BDBDBD" />
          <Text style={styles.tipText}>
            Możesz wyszukać kontener po jego numerze (np. TCKU7486791) lub numerze MRN
          </Text>
        </View>
      </View>
      
      {/* Dolne menu nawigacyjne */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="search" size={24} color="#1976D2" />
          <Text style={[styles.tabText, styles.activeTabText]}>Śledzenie</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <MaterialIcons name="star-border" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Zapisane</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="map" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Ruch statków</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    maxWidth: '100%',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 60,
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  activeTabText: {
    color: '#1976D2',
  },
});

export default HomeScreen;