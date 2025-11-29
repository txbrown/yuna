import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PersonaSelectionToolbar } from '../PersonaSelectionToolbar';
import { Persona, createPersona } from '@/features/personas/models/persona';
import { TextSelection } from '../usePersonaSelection';

// Mock PersonaAvatar
jest.mock('@/features/personas', () => ({
  PersonaAvatar: ({ persona }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`avatar-${persona.id}`}>{persona.name}</Text>;
  },
}));

describe('PersonaSelectionToolbar', () => {
  const mockPersona1: Persona = createPersona({
    name: 'Persona 1',
    description: 'Test',
    systemPrompt: 'Test prompt',
    temperature: 0.7,
    maxTokens: 1000,
    avatarConfig: { presetId: 'kid' },
  });

  const mockPersona2: Persona = createPersona({
    name: 'Persona 2',
    description: 'Test',
    systemPrompt: 'Test prompt',
    temperature: 0.7,
    maxTokens: 1000,
    avatarConfig: { presetId: 'engineer' },
  });

  const mockSelection: TextSelection = {
    start: 0,
    end: 10,
    text: 'Hello world',
  };

  const mockHeaderHeight = 100;

  it('should render nothing when visible is false', () => {
    const onPersonaSelect = jest.fn();
    const onDismiss = jest.fn();

    const { queryByText } = render(
      <PersonaSelectionToolbar
        visible={false}
        selection={mockSelection}
        headerHeight={mockHeaderHeight}
        personas={[mockPersona1]}
        onPersonaSelect={onPersonaSelect}
        onDismiss={onDismiss}
      />
    );

    expect(queryByText('Persona 1')).toBeNull();
  });

  it('should render nothing when selection is null', () => {
    const onPersonaSelect = jest.fn();
    const onDismiss = jest.fn();

    const { queryByText } = render(
      <PersonaSelectionToolbar
        visible={true}
        selection={null}
        headerHeight={mockHeaderHeight}
        personas={[mockPersona1]}
        onPersonaSelect={onPersonaSelect}
        onDismiss={onDismiss}
      />
    );

    expect(queryByText('Persona 1')).toBeNull();
  });

  it('should render persona avatars when visible', () => {
    const onPersonaSelect = jest.fn();
    const onDismiss = jest.fn();

    const { getByText } = render(
      <PersonaSelectionToolbar
        visible={true}
        selection={mockSelection}
        headerHeight={mockHeaderHeight}
        personas={[mockPersona1, mockPersona2]}
        onPersonaSelect={onPersonaSelect}
        onDismiss={onDismiss}
      />
    );

    expect(getByText('Persona 1')).toBeTruthy();
    expect(getByText('Persona 2')).toBeTruthy();
  });

  it('should call onPersonaSelect when persona is pressed', () => {
    const onPersonaSelect = jest.fn();
    const onDismiss = jest.fn();

    const { getByText } = render(
      <PersonaSelectionToolbar
        visible={true}
        selection={mockSelection}
        headerHeight={mockHeaderHeight}
        personas={[mockPersona1]}
        onPersonaSelect={onPersonaSelect}
        onDismiss={onDismiss}
      />
    );

    const personaButton = getByText('Persona 1');
    fireEvent.press(personaButton);

    expect(onPersonaSelect).toHaveBeenCalledWith(mockPersona1, mockSelection);
  });

  it('should handle empty personas array', () => {
    const onPersonaSelect = jest.fn();
    const onDismiss = jest.fn();

    const { toJSON } = render(
      <PersonaSelectionToolbar
        visible={true}
        selection={mockSelection}
        headerHeight={mockHeaderHeight}
        personas={[]}
        onPersonaSelect={onPersonaSelect}
        onDismiss={onDismiss}
      />
    );

    // Should render toolbar container but no personas
    expect(toJSON()).toBeTruthy();
  });
});
