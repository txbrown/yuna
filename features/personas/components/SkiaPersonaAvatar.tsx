import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { AvatarPreset } from '../constants';

interface SkiaPersonaAvatarProps {
  preset: AvatarPreset;
  size: number;
}

// Simple deterministic hash for consistent avatar generation from ID
const getFeatureIndex = (
  id: string,
  featureCount: number,
  salt: number = 0
) => {
  let hash = 0;
  const str = id + salt.toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % featureCount;
};

export const SkiaPersonaAvatar: React.FC<SkiaPersonaAvatarProps> = ({
  preset,
  size,
}) => {
  const strokeWidth = size * 0.04; // Thinner, doodle-like lines
  const center = size / 2;

  // Generate face paths
  const facePaths = useMemo(() => {
    const paths = Skia.Path.Make();

    // Constants for positioning
    const eyeY = size * 0.45;
    const eyeOffset = size * 0.18;
    const noseY = size * 0.55;
    const mouthY = size * 0.75;
    const hairY = size * 0.15;

    // 1. Eyes (5 variants)
    const eyeVariant = getFeatureIndex(preset.id, 5, 1);

    if (eyeVariant === 0) {
      // Dots
      paths.addCircle(center - eyeOffset, eyeY, strokeWidth * 1.5);
      paths.addCircle(center + eyeOffset, eyeY, strokeWidth * 1.5);
    } else if (eyeVariant === 1) {
      // Closed arcs (happy)
      const arcSize = size * 0.12;
      const p = Skia.Path.Make();
      p.moveTo(center - eyeOffset - arcSize / 2, eyeY);
      p.quadTo(
        center - eyeOffset,
        eyeY - arcSize,
        center - eyeOffset + arcSize / 2,
        eyeY
      );
      p.moveTo(center + eyeOffset - arcSize / 2, eyeY);
      p.quadTo(
        center + eyeOffset,
        eyeY - arcSize,
        center + eyeOffset + arcSize / 2,
        eyeY
      );
      paths.addPath(p);
    } else if (eyeVariant === 2) {
      // Lines (neutral/bored)
      const len = size * 0.12;
      const p = Skia.Path.Make();
      p.moveTo(center - eyeOffset - len / 2, eyeY);
      p.lineTo(center - eyeOffset + len / 2, eyeY);
      p.moveTo(center + eyeOffset - len / 2, eyeY);
      p.lineTo(center + eyeOffset + len / 2, eyeY);
      paths.addPath(p);
    } else if (eyeVariant === 3) {
      // Wide open (circles)
      const radius = size * 0.08;
      const p = Skia.Path.Make();
      p.addCircle(center - eyeOffset, eyeY, radius);
      p.addCircle(center + eyeOffset, eyeY, radius);
      paths.addPath(p);
    } else {
      // Sleepy/Calm (downward arcs)
      const arcSize = size * 0.12;
      const p = Skia.Path.Make();
      p.moveTo(center - eyeOffset - arcSize / 2, eyeY);
      p.quadTo(
        center - eyeOffset,
        eyeY + arcSize / 2,
        center - eyeOffset + arcSize / 2,
        eyeY
      );
      p.moveTo(center + eyeOffset - arcSize / 2, eyeY);
      p.quadTo(
        center + eyeOffset,
        eyeY + arcSize / 2,
        center + eyeOffset + arcSize / 2,
        eyeY
      );
      paths.addPath(p);
    }

    // 2. Nose (4 variants)
    const noseVariant = getFeatureIndex(preset.id, 4, 2);
    const pNose = Skia.Path.Make();

    if (noseVariant === 0) {
      // L-shape
      pNose.moveTo(center - size * 0.02, noseY - size * 0.05);
      pNose.lineTo(center - size * 0.02, noseY + size * 0.05);
      pNose.lineTo(center + size * 0.05, noseY + size * 0.05);
    } else if (noseVariant === 1) {
      // C-shape (button)
      pNose.moveTo(center + size * 0.02, noseY - size * 0.03);
      pNose.quadTo(
        center - size * 0.04,
        noseY,
        center + size * 0.02,
        noseY + size * 0.03
      );
    } else if (noseVariant === 2) {
      // Simple vertical line
      pNose.moveTo(center, noseY - size * 0.05);
      pNose.lineTo(center, noseY + size * 0.05);
    } else {
      // Triangle-ish / Pointy
      pNose.moveTo(center - size * 0.03, noseY + size * 0.05);
      pNose.lineTo(center, noseY - size * 0.05);
      pNose.lineTo(center + size * 0.03, noseY + size * 0.05);
    }
    paths.addPath(pNose);

    // 3. Mouth (5 variants)
    const mouthVariant = getFeatureIndex(preset.id, 5, 3);
    const pMouth = Skia.Path.Make();
    const mouthW = size * 0.2;

    if (mouthVariant === 0) {
      // Smile
      pMouth.moveTo(center - mouthW / 2, mouthY);
      pMouth.quadTo(center, mouthY + size * 0.1, center + mouthW / 2, mouthY);
    } else if (mouthVariant === 1) {
      // Neutral/Small line
      pMouth.moveTo(center - mouthW / 3, mouthY);
      pMouth.lineTo(center + mouthW / 3, mouthY);
    } else if (mouthVariant === 2) {
      // Smirk (slanted)
      pMouth.moveTo(center - mouthW / 2, mouthY + size * 0.02);
      pMouth.lineTo(center + mouthW / 2, mouthY - size * 0.02);
    } else if (mouthVariant === 3) {
      // Open (O)
      pMouth.addCircle(center, mouthY, size * 0.06);
    } else {
      // Frown/Sad
      pMouth.moveTo(center - mouthW / 2, mouthY + size * 0.05);
      pMouth.quadTo(
        center,
        mouthY - size * 0.05,
        center + mouthW / 2,
        mouthY + size * 0.05
      );
    }
    paths.addPath(pMouth);

    // 4. Hair/Top Feature (4 variants + none)
    const hairVariant = getFeatureIndex(preset.id, 5, 4);
    const pHair = Skia.Path.Make();

    if (hairVariant === 0) {
      // Single curl/hair
      pHair.moveTo(center, hairY + size * 0.1);
      pHair.quadTo(
        center + size * 0.1,
        hairY,
        center + size * 0.2,
        hairY - size * 0.05
      );
    } else if (hairVariant === 1) {
      // Three spikes
      pHair.moveTo(center - size * 0.15, hairY + size * 0.1);
      pHair.lineTo(center - size * 0.1, hairY);
      pHair.lineTo(center - size * 0.05, hairY + size * 0.1);
      pHair.lineTo(center, hairY);
      pHair.lineTo(center + size * 0.05, hairY + size * 0.1);
      pHair.lineTo(center + size * 0.1, hairY);
      pHair.lineTo(center + size * 0.15, hairY + size * 0.1);
    } else if (hairVariant === 2) {
      // Swoosh
      pHair.moveTo(center - size * 0.2, hairY + size * 0.1);
      pHair.quadTo(
        center,
        hairY - size * 0.05,
        center + size * 0.2,
        hairY + size * 0.05
      );
    } else if (hairVariant === 3) {
      // Flat top/Hat brim
      pHair.moveTo(center - size * 0.25, hairY + size * 0.05);
      pHair.lineTo(center + size * 0.25, hairY + size * 0.05);
    }
    // Variant 4 is bald/none
    paths.addPath(pHair);

    // 5. Eyebrows (optional, based on ID)
    if (getFeatureIndex(preset.id, 2, 5) === 1) {
      const browY = eyeY - size * 0.15;
      const browW = size * 0.12;
      const pBrow = Skia.Path.Make();

      pBrow.moveTo(center - eyeOffset - browW / 2, browY);
      pBrow.lineTo(center - eyeOffset + browW / 2, browY);

      pBrow.moveTo(center + eyeOffset - browW / 2, browY);
      pBrow.lineTo(center + eyeOffset + browW / 2, browY);
      paths.addPath(pBrow);
    }

    return paths;
  }, [preset.id, size, center, strokeWidth]);

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Just the face features, background is handled by container */}
      <Group
        style='stroke'
        strokeWidth={strokeWidth}
        strokeCap='round'
        strokeJoin='round'
      >
        <Path path={facePaths} color={preset.textColor} />
      </Group>
    </Canvas>
  );
};
