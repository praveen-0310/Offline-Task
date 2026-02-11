import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'small' | 'medium' | 'large';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  ...touchableProps
}) => {
  const getStyles = () => {
    const sizeStyles = {
      small: { paddingVertical: 10, paddingHorizontal: 14, fontSize: 13 },
      medium: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15 },
      large: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: '#6366F1',
        textColor: '#fff',
      },
      secondary: {
        backgroundColor: '#F3F4F6',
        textColor: '#374151',
      },
      danger: {
        backgroundColor: '#EF4444',
        textColor: '#fff',
      },
    };

    return { ...sizeStyles[size], ...variantStyles[variant] };
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      style={[
        stylesheet.container,
        {
          backgroundColor: styles.backgroundColor,
          paddingVertical: styles.paddingVertical,
          paddingHorizontal: styles.paddingHorizontal,
        },
        (disabled || loading) && stylesheet.disabledContainer,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={styles.textColor}
        />
      ) : (
        <Text
          style={[
            stylesheet.text,
            {
              fontSize: styles.fontSize,
              color: styles.textColor,
            },
            (disabled || loading) && stylesheet.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
