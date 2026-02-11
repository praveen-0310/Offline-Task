import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '../types';

interface Props {
  status: SyncStatus;
  size?: 'small' | 'medium';
}

export const SyncStatusBadge: React.FC<Props> = ({ status, size = 'medium' }) => {
  const getStyles = () => {
    const baseSize = size === 'small' ? 8 : 10;
    const baseFontSize = size === 'small' ? 10 : 12;

    switch (status) {
      case 'SYNCED':
        return {
          container: { backgroundColor: '#d4edda', borderColor: '#28a745' },
          dot: { backgroundColor: '#28a745', width: baseSize, height: baseSize },
          text: { color: '#155724', fontSize: baseFontSize },
          label: 'Synced',
        };
      case 'PENDING':
        return {
          container: { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
          dot: { backgroundColor: '#ffc107', width: baseSize, height: baseSize },
          text: { color: '#856404', fontSize: baseFontSize },
          label: 'Pending',
        };
      case 'FAILED':
        return {
          container: { backgroundColor: '#f8d7da', borderColor: '#dc3545' },
          dot: { backgroundColor: '#dc3545', width: baseSize, height: baseSize },
          text: { color: '#721c24', fontSize: baseFontSize },
          label: 'Failed',
        };
    }
  };

  const styles = getStyles();

  return (
    <View style={[stylesheet.container, styles.container]}>
      <View style={[stylesheet.dot, styles.dot]} />
      <Text style={[stylesheet.text, styles.text]}>{styles.label}</Text>
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  dot: {
    borderRadius: 50,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
  },
});
