import { renderHook, act } from '@testing-library/react-native';
import { usePersonaSelection } from '../usePersonaSelection';

describe('usePersonaSelection', () => {
  const mockContent = 'Hello world, this is a test string';

  it('should initialize with null selection', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    expect(result.current.selection).toBeNull();
  });

  it('should set selection from indices', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    act(() => {
      result.current.setSelectionFromIndices(0, 5);
    });

    expect(result.current.selection).toEqual({
      start: 0,
      end: 5,
      text: 'Hello',
    });
  });

  it('should extract text from content when not provided', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    act(() => {
      result.current.setSelectionFromIndices(6, 11);
    });

    expect(result.current.selection?.text).toBe('world');
  });

  it('should use provided text when given', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    act(() => {
      result.current.setSelectionFromIndices(0, 5, 'Custom text');
    });

    expect(result.current.selection?.text).toBe('Custom text');
  });

  it('should clear selection for collapsed range', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    act(() => {
      result.current.setSelectionFromIndices(5, 5);
    });

    expect(result.current.selection).toBeNull();
  });

  it('should clear selection manually', () => {
    const { result } = renderHook(() => usePersonaSelection(mockContent));

    act(() => {
      result.current.setSelectionFromIndices(0, 5);
    });

    expect(result.current.selection).not.toBeNull();

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selection).toBeNull();
  });

  it('should update selection when content changes', () => {
    const { result, rerender } = renderHook(
      (props: { content: string }) => usePersonaSelection(props.content),
      { initialProps: { content: mockContent } }
    );

    act(() => {
      result.current.setSelectionFromIndices(0, 5);
    });

    expect(result.current.selection?.text).toBe('Hello');

    // Rerender with new content - selection state preserved
    rerender({ content: 'Different content here' });
    
    // Set new selection on new content
    act(() => {
      result.current.setSelectionFromIndices(0, 9);
    });

    expect(result.current.selection?.text).toBe('Different');
  });
});

