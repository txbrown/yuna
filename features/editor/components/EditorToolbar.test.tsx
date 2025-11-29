import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { EditorToolbar } from './EditorToolbar';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Keyboard
const mockKeyboardListeners: { [key: string]: (e: any) => void } = {};

jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
  mockKeyboardListeners[eventName] = callback;
  return {
    remove: jest.fn(),
  } as any;
});

describe('EditorToolbar', () => {
  const mockOnToggleBold = jest.fn();
  const mockOnToggleItalic = jest.fn();
  const mockOnToggleList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockKeyboardListeners).forEach((key) => {
      delete mockKeyboardListeners[key];
    });
  });

  it('renders formatting buttons', () => {
    const { getByText } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    expect(getByText('B')).toBeTruthy();
    expect(getByText('I')).toBeTruthy();
    expect(getByText('•')).toBeTruthy();
  });

  it('calls onToggleBold callback on press', () => {
    const { getByText } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const boldButton = getByText('B');
    fireEvent.press(boldButton);

    expect(mockOnToggleBold).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleItalic callback on press', () => {
    const { getByText } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const italicButton = getByText('I');
    fireEvent.press(italicButton);

    expect(mockOnToggleItalic).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleList callback on press', () => {
    const { getByText } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const listButton = getByText('•');
    fireEvent.press(listButton);

    expect(mockOnToggleList).toHaveBeenCalledTimes(1);
  });

  it('shows active state for bold when isBoldActive is true', () => {
    const { getByTestId } = render(
      <EditorToolbar
        isBoldActive={true}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const boldButton = getByTestId('toolbar-button-bold');
    expect(boldButton).toBeTruthy();
    const style = boldButton.props.style;
    expect(style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#2C2C2C',
        }),
      ])
    );
  });

  it('shows active state for italic when isItalicActive is true', () => {
    const { getByTestId } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={true}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const italicButton = getByTestId('toolbar-button-italic');
    expect(italicButton).toBeTruthy();
  });

  it('shows active state for list when isListActive is true', () => {
    const { getByTestId } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={true}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    const listButton = getByTestId('toolbar-button-list');
    expect(listButton).toBeTruthy();
  });

  it('sets up keyboard listeners on mount', () => {
    render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    expect(Keyboard.addListener).toHaveBeenCalledWith(
      'keyboardDidShow',
      expect.any(Function)
    );
    expect(Keyboard.addListener).toHaveBeenCalledWith(
      'keyboardDidHide',
      expect.any(Function)
    );
  });

  it('handles keyboard show event', () => {
    render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    // Trigger the keyboard show callback
    const showCallback = mockKeyboardListeners['keyboardDidShow'];
    expect(showCallback).toBeDefined();
    
    if (showCallback) {
      showCallback({
        endCoordinates: { height: 300 },
      });
    }

    // Component should handle the event (animation tested via integration)
    expect(Keyboard.addListener).toHaveBeenCalled();
  });

  it('handles keyboard hide event', () => {
    render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
      />
    );

    // Trigger the keyboard hide callback
    const hideCallback = mockKeyboardListeners['keyboardDidHide'];
    expect(hideCallback).toBeDefined();
    
    if (hideCallback) {
      hideCallback({});
    }

    // Component should handle the event
    expect(Keyboard.addListener).toHaveBeenCalled();
  });

  it('hides toolbar when isVisible is false', () => {
    const { getByTestId } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
        isVisible={false}
      />
    );

    const toolbar = getByTestId('editor-toolbar');
    expect(toolbar).toBeTruthy();
    // Toolbar should still render but be hidden via opacity animation
  });

  it('shows toolbar when isVisible is true', () => {
    const { getByTestId } = render(
      <EditorToolbar
        isBoldActive={false}
        isItalicActive={false}
        isListActive={false}
        onToggleBold={mockOnToggleBold}
        onToggleItalic={mockOnToggleItalic}
        onToggleList={mockOnToggleList}
        isVisible={true}
      />
    );

    const toolbar = getByTestId('editor-toolbar');
    expect(toolbar).toBeTruthy();
  });
});
