import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReservasCancha from '../../../../src/screens/ControlUser/ReservasCancha';

export default function ReservasPorCanchaPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const canchaId = Number(id);

  return (
    <View style={styles.container}>
      <ReservasCancha canchaId={canchaId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
