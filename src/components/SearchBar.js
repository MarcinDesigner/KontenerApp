import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Komponent wyszukiwarki, który będzie używany na wszystkich ekranach
const SearchBar = ({ value, onChangeText, onSubmitEditing }) => {
  const [displayValue, setDisplayValue] = useState(value);

  // Funkcja konwertująca tekst na wielkie litery
  const handleTextChange = (text) => {
    setDisplayValue(text);
    // Przekazujemy tekst z wielkimi literami do komponentu nadrzędnego
    onChangeText(text.toUpperCase());
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Wyszukaj kontener lub MRN"
          placeholderTextColor="#9E9E9E"
          value={displayValue}
          onChangeText={handleTextChange}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="characters" // Automatycznie zmienia na wielkie litery
        />
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
    borderWidth: 1,
    borderColor: '#EEEEEE',
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
});

export default SearchBar;