export type GeolocationFailureCode =
  | "unsupported"
  | "insecure-context"
  | "permission-denied"
  | "position-unavailable"
  | "timeout"
  | "unknown";

export type GeolocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export class GeolocationRequestError extends Error {
  readonly failureCode: GeolocationFailureCode;
  readonly nativeCode: number | null;
  readonly canRetry: boolean;

  constructor(
    failureCode: GeolocationFailureCode,
    message: string,
    nativeCode: number | null = null,
    canRetry = true,
  ) {
    super(message);
    this.name = "GeolocationRequestError";
    this.failureCode = failureCode;
    this.nativeCode = nativeCode;
    this.canRetry = canRetry;
  }
}

type RequestOptions = {
  highAccuracyTimeoutMs?: number;
  fallbackTimeoutMs?: number;
  maximumAgeMs?: number;
};

type PositionLike = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
};

type PositionErrorLike = {
  code: number;
  message?: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
};

const DEFAULT_OPTIONS: Required<RequestOptions> = {
  highAccuracyTimeoutMs: 12_000,
  fallbackTimeoutMs: 20_000,
  maximumAgeMs: 30_000,
};

function secureContextAvailable() {
  return typeof window === "undefined" || window.isSecureContext;
}

function geolocationAvailable(): Geolocation {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new GeolocationRequestError(
      "unsupported",
      "เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับการเข้าถึงตำแหน่ง",
      null,
      false,
    );
  }
  if (!secureContextAvailable()) {
    throw new GeolocationRequestError(
      "insecure-context",
      "ต้องเปิดเว็บไซต์ผ่าน HTTPS จึงจะขอพิกัดได้",
      null,
      false,
    );
  }
  return navigator.geolocation;
}

function mapPosition(position: PositionLike): GeolocationResult {
  const { latitude, longitude, accuracy } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeolocationRequestError("unknown", "ได้รับค่าพิกัดไม่ถูกต้อง");
  }
  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy ?? NaN) ? (accuracy ?? null) : null,
  };
}

function mapError(error: PositionErrorLike): GeolocationRequestError {
  const permissionDenied = error.PERMISSION_DENIED ?? 1;
  const positionUnavailable = error.POSITION_UNAVAILABLE ?? 2;
  const timeout = error.TIMEOUT ?? 3;

  if (error.code === permissionDenied) {
    return new GeolocationRequestError(
      "permission-denied",
      "ไม่ได้รับอนุญาตให้ใช้ตำแหน่งของเว็บไซต์นี้",
      error.code,
      false,
    );
  }
  if (error.code === positionUnavailable) {
    return new GeolocationRequestError(
      "position-unavailable",
      "อุปกรณ์ยังหาสัญญาณตำแหน่งไม่ได้",
      error.code,
      true,
    );
  }
  if (error.code === timeout) {
    return new GeolocationRequestError(
      "timeout",
      "การค้นหาตำแหน่งใช้เวลานานเกินไป",
      error.code,
      true,
    );
  }
  return new GeolocationRequestError(
    "unknown",
    error.message || "ไม่สามารถอ่านตำแหน่งได้",
    error.code,
  );
}

function readOnce(
  geolocation: Geolocation,
  enableHighAccuracy: boolean,
  timeout: number,
  maximumAge: number,
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => {
        try {
          resolve(mapPosition(position));
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(mapError(error)),
      { enableHighAccuracy, timeout, maximumAge },
    );
  });
}

/**
 * Request a fresh position from a user gesture. Permission probing is not used
 * as a gate because Safari may not expose a reliable Permissions API state.
 */
export async function requestCurrentPosition(
  options: RequestOptions = {},
): Promise<GeolocationResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const geolocation = geolocationAvailable();

  try {
    return await readOnce(
      geolocation,
      true,
      config.highAccuracyTimeoutMs,
      Math.min(config.maximumAgeMs, 5_000),
    );
  } catch (error) {
    if (!(error instanceof GeolocationRequestError)) throw error;
    if (error.failureCode !== "timeout" && error.failureCode !== "position-unavailable")
      throw error;
  }

  return readOnce(geolocation, false, config.fallbackTimeoutMs, config.maximumAgeMs);
}

export function isEmbeddedContext() {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function describeGeolocationFailure(error: unknown) {
  const failureCode = error instanceof GeolocationRequestError ? error.failureCode : "unknown";
  const embedded = isEmbeddedContext();

  if (failureCode === "unsupported") return "เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับ GPS";
  if (failureCode === "insecure-context") return "ต้องเปิดเว็บผ่าน HTTPS จึงจะขอพิกัดได้";
  if (failureCode === "permission-denied") {
    return embedded
      ? "หน้าตัวอย่างไม่อนุญาตให้ใช้ GPS — เปิดเว็บในแท็บ Safari ใหม่แล้วลองอีกครั้ง"
      : "Safari ไม่ได้รับสิทธิ์ตำแหน่ง — แตะไอคอนตั้งค่าเว็บไซต์ในแถบที่อยู่ แล้วตั้ง Location เป็น Allow หรือ Ask จากนั้นลองใหม่";
  }
  if (failureCode === "position-unavailable") {
    return "ยังหาสัญญาณตำแหน่งไม่ได้ — เปิด Location Services, ออกไปที่โล่ง หรือแตะลองใหม่อีกครั้ง";
  }
  if (failureCode === "timeout")
    return "ค้นหาตำแหน่งนานเกินไป — ลองเปิด Wi‑Fi/GPS แล้วแตะลองใหม่อีกครั้ง";
  return "ไม่สามารถอ่านตำแหน่งได้ — กรุณาลองใหม่หรือกรอกสถานที่เอง";
}
