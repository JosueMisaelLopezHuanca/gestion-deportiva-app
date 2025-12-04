import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReservasList from '../../../src/screens/ControlUser/ReservasList';

export default function ReservasPage() {
  return (
    <View style={styles.container}>
      <ReservasList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
