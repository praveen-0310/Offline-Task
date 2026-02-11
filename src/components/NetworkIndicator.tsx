import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../hooks';

export const NetworkIndicator: React.FC = () => {
  const { isConnected } = useAppSelector((state) => state.network);

  if (isConnected) {
    return null; // Don't show when connected
  }

  return (
    <View style={stylesheet.container}>
      <View style={stylesheet.dot} />
      <Text style={stylesheet.text}>Offline Mode</Text>
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: '#dc3545',
    borderBottomWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
    marginRight: 8,
  },
  text: {
    color: '#721c24',
    fontSize: 12,
    fontWeight: '600',
  },
});
