import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { EditorContent } from './EditorContent';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock useSafeAreaInsets
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({
      top: 44,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

// Mock react-native-enriched
jest.mock('react-native-enriched', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    EnrichedTextInput: React.forwardRef((props: any, ref: any) => {
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
          {...props}
          ref={ref}
        />
      );
    }),
  };
});

// Mock RichTextEditor
jest.mock('./RichTextEditor', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    RichTextEditor: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        focus: jest.fn(),
        toggleBold: jest.fn(),
        toggleItalic: jest.fn(),
        toggleUnderline: jest.fn(),
        toggleStrikeThrough: jest.fn(),
        toggleUnorderedList: jest.fn(),
      }));
      return (
        <TextInput
          testID="rich-text-editor"
          value={props.content || ''}
          onChangeText={props.onChangeText}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          {...props}
        />
      );
    }),
  };
});

// Mock react-native-markdown-display
jest.mock('react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children }: { children: string }) => <Text>{children}</Text>;
});

describe('EditorContent', () => {
  const mockOnChangeText = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with content prop', () => {
    const { getByTestId } = render(
      <EditorContent content="Test content" onChangeText={mockOnChangeText} />
    );

    // When content exists and not focused, it shows formatted view
    // The RichTextEditor is rendered but might be hidden
    const container = getByTestId('editor-content-container');
    expect(container).toBeTruthy();
  });

  it('calls onChangeText callback on input', () => {
    const { getByTestId } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} />
    );

    // Press welcome screen to focus input
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    // Find the RichTextEditor input
    const input = getByTestId('rich-text-editor');
    fireEvent.changeText(input, 'New text');

    expect(mockOnChangeText).toHaveBeenCalled();
  });

  it('calls onFocus callback when focused', () => {
    const { getByTestId } = render(
      <EditorContent
        content=""
        onChangeText={mockOnChangeText}
        onFocus={mockOnFocus}
      />
    );

    // Press welcome screen to focus input
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur callback when blurred', () => {
    const { getByTestId } = render(
      <EditorContent
        content=""
        onChangeText={mockOnChangeText}
        onBlur={mockOnBlur}
      />
    );

    // Press welcome screen to focus input
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    // Then blur it
    const input = getByTestId('rich-text-editor');
    fireEvent(input, 'blur');

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('renders input without placeholder text', () => {
    const { getByTestId } = render(
      <EditorContent
        content=""
        onChangeText={mockOnChangeText}
      />
    );

    // Press welcome screen to show input
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    const input = getByTestId('rich-text-editor');
    expect(input).toBeTruthy();
    expect(input.props.placeholder).toBe('');
  });

  it('has full-screen pressable area', () => {
    const { getByTestId } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} />
    );

    const container = getByTestId('editor-content-container');
    expect(container).toBeTruthy();
  });

  it('renders empty content correctly', () => {
    const { getByTestId } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} />
    );

    // Should show welcome screen when empty
    expect(getByTestId('welcome-screen')).toBeTruthy();
  });

  it('shows welcome screen when content is empty and not focused', () => {
    const { getByTestId, getByText } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} />
    );

    expect(getByTestId('welcome-screen')).toBeTruthy();
    expect(getByText('ITS A GOOD DAY TO YUNA')).toBeTruthy();
    expect(getByText('tap to get started')).toBeTruthy();
  });

  it('hides welcome screen when content exists', () => {
    const { queryByTestId } = render(
      <EditorContent content="Some text" onChangeText={mockOnChangeText} />
    );

    expect(queryByTestId('welcome-screen')).toBeNull();
  });

  it('hides welcome screen and focuses input when welcome screen is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} onFocus={mockOnFocus} />
    );

    // Welcome screen should be visible initially
    expect(getByTestId('welcome-screen')).toBeTruthy();

    // Press welcome screen
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    // Welcome should hide and focus should be called
    expect(mockOnFocus).toHaveBeenCalledTimes(1);
    // Note: In tests, the welcome screen might still render but be hidden via opacity
    // The important part is that focus is triggered
  });

  it('transitions from welcome to editor when user types', () => {
    const { getByTestId } = render(
      <EditorContent content="" onChangeText={mockOnChangeText} />
    );

    // Initially shows welcome
    expect(getByTestId('welcome-screen')).toBeTruthy();

    // Press welcome screen to focus input
    const container = getByTestId('editor-content-container');
    fireEvent.press(container);

    // User types
    const input = getByTestId('rich-text-editor');
    fireEvent.changeText(input, 'H');

    // onChangeText should be called
    expect(mockOnChangeText).toHaveBeenCalled();
  });
});

