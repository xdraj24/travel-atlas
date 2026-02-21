export interface AltitudeSafetyInput {
  altitudeMeters?: number | null;
  pregnancySafe?: boolean | null;
  infantSafe?: boolean | null;
}

export interface ComputedSafety {
  pregnancySafe: boolean;
  infantSafe: boolean;
}

export function computeSafetyWithAltitudeFallback(
  input: AltitudeSafetyInput,
): ComputedSafety {
  const altitude = input.altitudeMeters ?? 0;
  const altitudeUnsafe = altitude > 2500;

  if (altitudeUnsafe) {
    return {
      pregnancySafe: false,
      infantSafe: false,
    };
  }

  return {
    pregnancySafe: input.pregnancySafe ?? true,
    infantSafe: input.infantSafe ?? true,
  };
}
