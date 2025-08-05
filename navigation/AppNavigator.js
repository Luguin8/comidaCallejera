// /navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddReviewScreen from '../screens/AddReviewScreen';

import HomeScreen from '../screens/HomeScreen';
import PuestoDetailScreen from '../screens/PuestoDetailScreen';
import DuenosLoginScreen from '../screens/DuenosLoginScreen';
// Importa otras pantallas a medida que las crees

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Puestos de Comida' }} />
        <Stack.Screen name="PuestoDetail" component={PuestoDetailScreen} options={{ title: 'Detalles del Puesto' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Ingresar o Registrarse' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Dejar una Opinión' }} />
        <Stack.Screen name="DuenosLogin" component={DuenosLoginScreen} options={{ title: 'Ingreso Dueños' }} />
        {/* Aquí agregarás las pantallas de , Encargos, etc. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}