import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase'; // Asegurate que exportas tu instancia Firestore

export default function DuenosLoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!usuario || !contrasena) {
      Alert.alert('Error', 'Por favor, completá usuario y contraseña');
      return;
    }
    setLoading(true);

    try {
      const duenosRef = collection(db, 'duenos');
      const q = query(duenosRef, where('usuario', '==', usuario));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Usuario no encontrado');
        setLoading(false);
        return;
      }

      // Asumiendo que el usuario es único, tomo el primero
      const duenoDoc = querySnapshot.docs[0];
      const duenoData = duenoDoc.data();

      if (duenoData.password === contrasena) {  // En texto plano, luego podés mejorar con hash
        Alert.alert('Bienvenido', 'Acceso concedido al panel de dueño');
        navigation.navigate('PanelDueno', { duenoId: duenoDoc.id, usuario: usuario });
      } else {
        Alert.alert('Error', 'Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error al autenticar dueño:', error);
      Alert.alert('Error', 'Error al conectar con el servidor');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingreso Dueños</Text>

      <TextInput
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
        secureTextEntry
      />

      <Button
        title={loading ? 'Ingresando...' : 'Ingresar al panel de dueño'}
        onPress={handleLogin}
        disabled={loading}
      />

      {/* Botón ayuda deshabilitado */}
      <TouchableOpacity
        style={[styles.helpButton, styles.disabledButton]}
        disabled={true}
        onPress={() => {}}
      >
        <Text style={styles.helpButtonText}>Solicitar ayuda (proximamente)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  helpButton: {
    marginTop: 30,
    backgroundColor: '#aaa',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  helpButtonText: {
    color: '#555',
    fontSize: 16,
  },
});
