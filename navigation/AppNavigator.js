// /navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PuestoDetailScreen from '../screens/PuestoDetailScreen';
// Importa otras pantallas a medida que las crees

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Puestos de Comida' }} />
        <Stack.Screen name="PuestoDetail" component={PuestoDetailScreen} options={{ title: 'Detalles del Puesto' }} />
        {/* Aquí agregarás las pantallas de Opiniones, Encargos, etc. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}