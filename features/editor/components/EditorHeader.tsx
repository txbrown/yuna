import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface EditorHeaderProps {
  onBackPress?: () => void;
  onSharePress?: () => void;
  title?: string;
}

/**
 * @description Custom transparent header for the editor
 * @example
 * <EditorHeader
 *   onBackPress={handleBack}
 *   onSharePress={handleShare}
 *   title="My Note"
 * />
 */
export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onBackPress,
  onSharePress,
  title,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="editor-header"
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        },
      ]}
    >
      <View style={styles.content}>
        {onBackPress && (
          <Pressable
            testID="header-back-button"
            style={styles.iconButton}
            onPress={onBackPress}
          >
            <Ionicons name="chevron-back" size={20} color="#000" />
          </Pressable>
        )}

        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {onSharePress && (
          <Pressable
            testID="header-share-button"
            style={styles.iconButton}
            onPress={onSharePress}
          >
            <Ionicons name="share-outline" size={20} color="#000" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    marginHorizontal: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Orbitron_500Medium',
    color: '#000',
  },
});

