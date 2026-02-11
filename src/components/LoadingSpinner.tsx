import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<Props> = ({ size = 'large' }) => {
  return (
    <View style={stylesheet.container}>
      <ActivityIndicator size={size} color="#007AFF" />
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
