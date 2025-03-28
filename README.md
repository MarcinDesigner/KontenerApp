# Funkcje w aplikacji Container Tracking

## Zestaw funkcji

### Główne funkcje
1. **Wyszukiwanie kontenerów** - możliwość wyszukiwania kontenerów po numerze lub kodzie MRN
2. **Filtrowanie** - filtrowanie kontenerów (Import/Export/Wszystkie)
3. **Historia wyszukiwań** - zapisywanie i wyświetlanie ostatnio wyszukiwanych kontenerów
4. **Ulubione kontenery** - możliwość zapisania kontenerów do szybkiego dostępu
5. **Szczegóły kontenera** - wyświetlanie szczegółowych informacji o kontenerze
6. **Informacje o statusie** - wyświetlanie aktualnego statusu kontenerów i postępu dostawy
7. **Historia statusów** - oś czasu z historią zmian statusu kontenera

### API i zarządzanie danymi
1. `getContainerDetails` - pobieranie szczegółów kontenera
2. `searchContainers` - wyszukiwanie kontenerów
3. `getFavorites` - pobieranie ulubionych kontenerów
4. `addToFavorites` - dodawanie kontenera do ulubionych
5. `removeFromFavorites` - usuwanie kontenera z ulubionych
6. `isFavorite` - sprawdzanie czy kontener jest w ulubionych
7. `getSearchHistory` - pobieranie historii wyszukiwań
8. `addToSearchHistory` - dodawanie zapytania do historii
9. `removeFromSearchHistory` - usuwanie zapytania z historii
10. `clearSearchHistory` - czyszczenie całej historii wyszukiwań
11. `getSearchResults` - pobieranie wyników wyszukiwań
12. `addSearchResults` - zapisywanie wyników wyszukiwań
13. `removeSearchResult` - usuwanie wyniku wyszukiwania
14. `clearSearchResults` - czyszczenie wszystkich wyników wyszukiwań

## Nowe funkcje

### Odświeżanie danych
1. **Pull-to-refresh** - odświeżanie danych przez przeciągnięcie listy w dół
   - Zaimplementowane w ContainerListScreen, FavoritesScreen i HomeScreen
   - Funkcja `onRefresh` uruchamiana przez gest przeciągnięcia
   - Stan `refreshing` kontrolujący widoczność animacji odświeżania

2. **Automatyczna synchronizacja danych**
   - `refreshContainersData` - odświeżanie danych kontenerów z API
   - `updateResultsInStorage` - zapisywanie zaktualizowanych danych w pamięci
   - `updateFavoritesInStorage` - zapisywanie zaktualizowanych ulubionych w pamięci
   - Wykrywanie zmian w danych przed aktualizacją (optymalizacja wydajności)

3. **Automatyczne odświeżanie w tle**
   - Interwał odświeżania danych co 5 minut
   - Funkcja `setupRefreshInterval` do zarządzania interwałem
   - Referencja `refreshInterval` do czyszczenia interwału

4. **Monitorowanie stanu aplikacji**
   - Wykorzystanie `AppState` do wykrywania zmian stanu aplikacji
   - Odświeżanie danych przy powrocie aplikacji z tła do aktywnego stanu
   - Resetowanie interwału przy powrocie aplikacji z tła

### Obsługa stanu kontenera
1. **Statusy kontenerów**
   - Rozszerzone mapowanie statusów (GATE_IN jako "Wyładunek kontenera")
   - Poprawione przypisywanie typów Import/Export na podstawie statusu
   - Usunięcie etapu "Dostarczenie" z historii statusów

2. **Optymalizacje i poprawki**
   - Sprawdzanie zmian w danych przed aktualizacją
   - Lepsze zarządzanie pamięcią i efektami w komponencie
   - Dodatkowe logowanie do debugowania
   - Obsługa błędów w procesie aktualizacji danych
