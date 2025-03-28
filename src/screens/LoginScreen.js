import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a0d4b' }} />
    );
  }

  const handleLogin = () => {
    console.log('Login attempt with:', { email, password });
    // Tutaj dodasz logikę logowania z API
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0d4b" />
      <LinearGradient
        colors={['#1a0d4b', '#0f2246', '#1a485a']}
        style={styles.background}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/polski-pcs-logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Witaj z powrotem</Text>
                <Text style={styles.instructionText}>
                  Zaloguj się, aby kontynuować
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Twój adres email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Hasło</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Twoje hasło"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.forgotPasswordContainer}
                  accessibilityRole="button"
                  accessibilityLabel="Zapomniałeś hasła"
                >
                  <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  accessibilityRole="button"
                  accessibilityLabel="Zaloguj się"
                >
                  <Text style={styles.loginButtonText}>Zaloguj się</Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Nie masz jeszcze konta? </Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Zarejestruj się"
                  >
                    <Text style={styles.signupLink}>Zarejestruj się</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 50,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    color: 'white',
    marginBottom: 5,
  },
  instructionText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    color: 'white',
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loginButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#1a0d4b',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  signupLink: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: 'white',
  },
});

export default LoginScreen;