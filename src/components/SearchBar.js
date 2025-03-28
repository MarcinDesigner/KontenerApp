import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Komponent wyszukiwarki, który będzie używany na wszystkich ekranach
const SearchBar = ({ value, onChangeText, onSubmitEditing }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  // Funkcja konwertująca tekst na wielkie litery
  const handleTextChange = (text) => {
    setDisplayValue(text);
    // Przekazujemy tekst z wielkimi literami do komponentu nadrzędnego
    onChangeText(text.toUpperCase());
  };
  
  // Funkcja czyszcząca pole wyszukiwania
  const handleClear = () => {
    setDisplayValue('');
    onChangeText('');
  };

  return (
    <View style={styles.searchContainer}>
      <View style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused
      ]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={isFocused ? "#1976D2" : "#9E9E9E"} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={[
            styles.searchInput,
            displayValue && styles.searchInputWithText
          ]}
          placeholder="Wyszukaj kontener lub MRN"
          placeholderTextColor="#9E9E9E"
          value={displayValue}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="characters" // Automatycznie zmienia na wielkie litery
        />
        {displayValue ? (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  searchBarFocused: {
    borderColor: '#1976D2',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    textTransform: 'uppercase', // Teksty zawsze wyświetlane wielkimi literami
  },
  searchInputWithText: {
    fontWeight: '600', // SemiBold dla wpisanego tekstu
  },
  clearButton: {
    padding: 4,
  }
});

export default SearchBar;