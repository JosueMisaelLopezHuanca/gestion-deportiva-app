import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GridCanchas from '../Components/GridCanchas';
import { buscarCanchasPorNombre } from '../../../services/CanchaApi';

export default function BuscarScreen() {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async (value: string) => {
    setTexto(value);
    if (value.trim() === '') {
      setResultados([]);
      return;
    }

    try {
      setLoading(true);
      const data = await buscarCanchasPorNombre(value);
      setResultados(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error buscando canchas:', err);
      setError('No se encontraron canchas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-14">
      <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🔍 Buscar Canchas
      </Text>

      {/* Campo de búsqueda */}
      <View className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-4">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          placeholder="Buscar por nombre..."
          value={texto}
          onChangeText={handleBuscar}
          className="ml-2 flex-1 text-gray-700"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Loader */}
      {loading && (
        <ActivityIndicator size="large" color="#41BFB2" className="mt-4" />
      )}

      {/* Error */}
      {error ? (
        <Text className="text-center text-gray-500 mt-4">{error}</Text>
      ) : null}

      {/* Resultados */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {resultados.map((cancha) => (
            <GridCanchas key={cancha.idCancha} cancha={cancha} />
          ))}
        </View>

        {resultados.length === 0 && texto.length > 0 && !loading && (
          <Text className="text-center mt-6 text-gray-500">
            No se encontraron canchas con ese nombre.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
