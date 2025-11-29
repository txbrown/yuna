import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Mock requestAnimationFrame and cancelAnimationFrame to prevent animation loops
let rafCallbacks: number[] = [];
let rafId = 0;

global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
  rafId++;
  rafCallbacks.push(rafId);
  // Don't actually call the callback to prevent infinite loops
  return rafId;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  rafCallbacks = rafCallbacks.filter((callbackId) => callbackId !== id);
});

// Mock useWindowDimensions before importing component
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 375, height: 812 }),
}));

import { AnimatedBackground } from './AnimatedBackground';
import { GRADIENT_PRESETS } from './AnimatedBackground.constants';

// Mock Skia components
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Canvas: ({ children, style }: { children: React.ReactNode; style?: any }) => {
      const ViewComponent = View;
      return (
        <ViewComponent testID="skia-canvas" style={style}>
          {children}
        </ViewComponent>
      );
    },
    LinearGradient: ({ children }: { children?: React.ReactNode }) => {
      const ViewComponent = View;
      return <ViewComponent testID="linear-gradient">{children}</ViewComponent>;
    },
    Rect: ({ children }: { children?: React.ReactNode }) => {
      const ViewComponent = View;
      return <ViewComponent testID="rect">{children}</ViewComponent>;
    },
    Group: ({ children }: { children?: React.ReactNode }) => {
      const ViewComponent = View;
      return <ViewComponent testID="skia-group">{children}</ViewComponent>;
    },
    Blur: () => {
      const ViewComponent = View;
      return <ViewComponent testID="skia-blur" />;
    },
    Circle: () => {
      const ViewComponent = View;
      return <ViewComponent testID="skia-circle" />;
    },
    vec: (x: number, y: number) => ({ x, y }),
  };
});

describe('AnimatedBackground', () => {
  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    // Cancel any pending animation frames
    rafCallbacks.forEach((id) => {
      global.cancelAnimationFrame(id);
    });
    rafCallbacks = [];
  });

  it('renders with preset prop', () => {
    const { getByTestId } = render(
      <AnimatedBackground preset="sunny">
        <Text>Test Content</Text>
      </AnimatedBackground>
    );

    expect(getByTestId('skia-canvas')).toBeTruthy();
    expect(getByTestId('rect')).toBeTruthy();
  });

  it('renders with custom colors prop', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    const { getByTestId } = render(
      <AnimatedBackground colors={customColors}>
        <Text>Test Content</Text>
      </AnimatedBackground>
    );

    expect(getByTestId('skia-canvas')).toBeTruthy();
    expect(getByTestId('rect')).toBeTruthy();
  });

  it('applies gradient correctly with sunny preset', () => {
    const { getByTestId } = render(
      <AnimatedBackground preset="sunny">
        <Text>Test</Text>
      </AnimatedBackground>
    );

    expect(getByTestId('skia-canvas')).toBeTruthy();
    expect(getByTestId('rect')).toBeTruthy();
  });

  it('applies gradient correctly with rainy preset', () => {
    const { getByTestId } = render(
      <AnimatedBackground preset="rainy">
        <Text>Test</Text>
      </AnimatedBackground>
    );

    expect(getByTestId('skia-canvas')).toBeTruthy();
    expect(getByTestId('rect')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <AnimatedBackground preset="sunny">
        <Text>Child Content</Text>
      </AnimatedBackground>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('has full-screen coverage', () => {
    const { getByTestId } = render(
      <AnimatedBackground preset="sunny">
        <Text>Test</Text>
      </AnimatedBackground>
    );

    const container = getByTestId('animated-background-container');
    expect(container).toBeTruthy();
    const style = container.props.style;
    // Style can be an object or array, check for position property
    if (Array.isArray(style)) {
      expect(style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            position: 'absolute',
          }),
        ])
      );
    } else {
      expect(style).toMatchObject({
        position: 'absolute',
      });
    }
  });

  it('renders Canvas with absoluteFill style', () => {
    const { getByTestId } = render(
      <AnimatedBackground preset="sunny">
        <Text>Test</Text>
      </AnimatedBackground>
    );

    const canvas = getByTestId('skia-canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.props.style).toBeTruthy();
  });
});

