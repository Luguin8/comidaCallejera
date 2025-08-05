import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("Éxito", "¡Cuenta creada exitosamente!");
        navigation.goBack();
      })
      .catch(error => Alert.alert("Error de Registro", error.message));
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("Éxito", "¡Has ingresado!");
        navigation.goBack();
      })
      .catch(error => Alert.alert("Error de Ingreso", error.message));
  };

  const handleAnonymousLogin = () => {
    signInAnonymously(auth)
      .then(() => {
        Alert.alert("Éxito", "¡Has ingresado como anónimo!");
        navigation.goBack();
      })
      .catch(error => Alert.alert("Error", error.message));
  };

  const forgotPassword = () => {
    if (!email) {
      Alert.alert("Atención", "Por favor, ingresa tu email para recuperar la contraseña.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Correo enviado", "Revisa tu correo electrónico para restablecer tu contraseña.");
      })
      .catch(error => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry={true}
      />

      <View style={styles.buttonContainer}>
        <Button title="Ingresar" onPress={handleLogin} />
        <Button title="Registrarse" onPress={handleSignUp} />
      </View>

      <TouchableOpacity onPress={forgotPassword} style={styles.forgotContainer}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.separator} />
      <Button title="Continuar como Anónimo" onPress={handleAnonymousLogin} color="#841584" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  separator: {
    marginVertical: 20,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
