import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const handleStart = () => {
    // Przejście do ekranu głównego po kliknięciu przycisku
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B002E" />
      <LinearGradient
        colors={['#1A006B', '#0f2246', '#0B002E']}
        style={styles.background}
      >
        {/* Logo na górze */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/polski-pcs-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Treść główna */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Śledzenie</Text>
          <Text style={styles.title}>kontenerów</Text>
          
          {/* Obraz kontenera */}
          <Image
            source={require('../../assets/images/container.png')}
            style={styles.containerImage}
            resizeMode="contain"
          />
          
          <Text style={styles.subtitle}>
            Twoje ładunki zawsze pod kontrolą
          </Text>
          <Text style={styles.subtitle}>
            gdziekolwiek jesteś.
          </Text>
        </View>

        {/* Przycisk */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Rozpocznij</Text>
            <Text style={styles.buttonIcon}>→</Text>
          </TouchableOpacity>
          
          {/* Stopka */}
          <Text style={styles.footerText}>
            Powered by PolskiPCS.pl
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0d4b',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.05,
    paddingVertical: 10,
  },
  logo: {
    width: 150,
    height: 50,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 53,
  },
  containerImage: {
    width: width * 1.0,
    height: height * 0.39,
    marginVertical: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: height * 0.01,
    paddingVertical: 24,
  },
  button: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 50,
    width: '80%',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a0d4b',
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 18,
    color: '#1a0d4b',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SplashScreen;