import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GeolocationRequestError,
  describeGeolocationFailure,
  requestCurrentPosition,
} from "./geolocation";

const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

function installGeolocation(getCurrentPosition: Geolocation["getCurrentPosition"]) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { geolocation: { getCurrentPosition } },
  });
}

function installWindow(isSecureContext: boolean) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { isSecureContext, self: {}, top: {} },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: originalNavigator });
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
});

describe("requestCurrentPosition", () => {
  it("returns coordinates and accuracy from a successful request", async () => {
    const getCurrentPosition = vi.fn(
      (success: PositionCallback, _error?: PositionErrorCallback, _options?: PositionOptions) => {
        success({
          coords: { latitude: 13.7563, longitude: 100.5018, accuracy: 12 },
        } as GeolocationPosition);
      },
    );
    installWindow(true);
    installGeolocation(getCurrentPosition);

    await expect(requestCurrentPosition()).resolves.toEqual({
      latitude: 13.7563,
      longitude: 100.5018,
      accuracy: 12,
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(getCurrentPosition.mock.calls[0]?.[2]).toMatchObject({
      enableHighAccuracy: true,
      maximumAge: 5_000,
    });
  });

  it("does not retry after permission is denied", async () => {
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: "denied" } as GeolocationPositionError);
    });
    installWindow(true);
    installGeolocation(getCurrentPosition);

    const result = requestCurrentPosition();
    await expect(result).rejects.toMatchObject({ failureCode: "permission-denied" });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("retries without high accuracy after a timeout", async () => {
    const getCurrentPosition = vi
      .fn()
      .mockImplementationOnce((_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 3, message: "timeout" } as GeolocationPositionError);
      })
      .mockImplementationOnce((success: PositionCallback) => {
        success({
          coords: { latitude: 13.7, longitude: 100.5, accuracy: 80 },
        } as GeolocationPosition);
      });
    installWindow(true);
    installGeolocation(getCurrentPosition);

    await expect(requestCurrentPosition()).resolves.toMatchObject({
      latitude: 13.7,
      longitude: 100.5,
      accuracy: 80,
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(getCurrentPosition.mock.calls[1]?.[2]).toMatchObject({
      enableHighAccuracy: false,
      maximumAge: 30_000,
    });
  });

  it("rejects before calling the browser API on an insecure context", async () => {
    const getCurrentPosition = vi.fn();
    installWindow(false);
    installGeolocation(getCurrentPosition);

    await expect(requestCurrentPosition()).rejects.toMatchObject({
      failureCode: "insecure-context",
    });
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("provides actionable Safari guidance for denied permission", () => {
    installWindow(true);
    expect(
      describeGeolocationFailure(new GeolocationRequestError("permission-denied", "denied", 1)),
    ).toContain("Safari");
  });
});
