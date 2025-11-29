import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RichTextEditor } from '../RichTextEditor';

// Mock react-native-enriched with proper event handling
jest.mock('react-native-enriched', () => {
  const React = require('react');
  const { View, TextInput } = require('react-native');
  
  return {
    EnrichedTextInput: React.forwardRef((props: any, ref: any) => {
      const { onChangeSelection, onChangeHtml, onChangeText, onChangeState, ...rest } = props;
      
      React.useImperativeHandle(ref, () => ({
        focus: jest.fn(),
        toggleBold: jest.fn(),
        toggleItalic: jest.fn(),
        toggleUnderline: jest.fn(),
        toggleStrikeThrough: jest.fn(),
        toggleUnorderedList: jest.fn(),
        setValue: jest.fn(),
      }));
      
      return (
        <TextInput
          testID="enriched-text-input"
          onSelectionChange={(e: any) => {
            // Map onSelectionChange to the component's onChangeSelection
            if (onChangeSelection && e.nativeEvent) {
              onChangeSelection(e);
            }
          }}
          {...rest}
          ref={ref}
        />
      );
    }),
  };
});

describe('RichTextEditor', () => {
  const mockContent = 'Hello world, this is a test';

  it('should call onChangeSelection with text when provided in event', () => {
    const mockOnChangeSelection = jest.fn();

    const { getByTestId } = render(
      <RichTextEditor
        content={mockContent}
        onChangeText={jest.fn()}
        onChangeSelection={mockOnChangeSelection}
      />
    );

    const input = getByTestId('enriched-text-input');

    // Simulate selection change event with text
    fireEvent(input, 'onSelectionChange', {
      nativeEvent: {
        start: 0,
        end: 5,
        text: 'Hello',
      },
    });

    expect(mockOnChangeSelection).toHaveBeenCalledWith(0, 5, 'Hello');
  });

  it('should extract text from content when not provided in event', () => {
    const mockOnChangeSelection = jest.fn();

    const { getByTestId } = render(
      <RichTextEditor
        content={mockContent}
        onChangeText={jest.fn()}
        onChangeSelection={mockOnChangeSelection}
      />
    );

    const input = getByTestId('enriched-text-input');

    // Simulate selection change event without text
    fireEvent(input, 'onSelectionChange', {
      nativeEvent: {
        start: 0,
        end: 5,
      },
    });

    expect(mockOnChangeSelection).toHaveBeenCalledWith(0, 5, 'Hello');
  });

  it('should handle selection change with empty text', () => {
    const mockOnChangeSelection = jest.fn();

    const { getByTestId } = render(
      <RichTextEditor
        content={mockContent}
        onChangeText={jest.fn()}
        onChangeSelection={mockOnChangeSelection}
      />
    );

    const input = getByTestId('enriched-text-input');

    // Simulate collapsed selection
    fireEvent(input, 'onSelectionChange', {
      nativeEvent: {
        start: 5,
        end: 5,
      },
    });

    expect(mockOnChangeSelection).toHaveBeenCalledWith(5, 5, '');
  });
});

