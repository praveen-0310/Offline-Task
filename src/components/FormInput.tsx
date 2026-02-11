import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, Animated } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormInput: React.FC<Props> = ({
  label,
  error,
  required = false,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#6366F1'],
  });

  return (
    <View style={stylesheet.container}>
      <Text style={stylesheet.label}>
        {label}
        {required && <Text style={stylesheet.required}>*</Text>}
      </Text>
      <Animated.View style={{ borderColor }}>
        <TextInput
          style={[
            stylesheet.input,
            error ? stylesheet.inputError : null,
            isFocused && stylesheet.inputFocused,
          ]}
          placeholderTextColor="#D1D5DB"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
      </Animated.View>
      {error && <Text style={stylesheet.errorText}>{error}</Text>}
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  required: {
    color: '#EF4444',
    marginLeft: 4,
    fontSize: 15,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  inputFocused: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
