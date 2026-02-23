import { useEffect, Dispatch, SetStateAction } from 'react';

/**
 * useInitialCameraPermission
 *
 * Encapsulates mount-time camera permission bootstrap logic:
 * 1. Attempts Permissions API (primary)
 * 2. Falls back to getUserMedia probe if API unavailable
 * 3. Handles permission changes listener
 * 4. Sets state for both cameraPermission and showPermissionWarning
 *
 * @param setCameraPermission - State setter for permission state ('granted'|'denied'|'prompt')
 * @param setShowPermissionWarning - State setter for warning visibility (true if denied)
 * @param warningContext - Logging context (e.g., 'AlphabetGame permission bootstrap error')
 * @param warnFn - Warning function for errors (e.g., warnAlphabetGame)
 */
export function useInitialCameraPermission(
  setCameraPermission: Dispatch<SetStateAction<'granted' | 'denied' | 'prompt'>>,
  setShowPermissionWarning: Dispatch<SetStateAction<boolean>>,
  warningContext: string = 'Camera permission bootstrap',
  warnFn: (context: string, error: unknown) => void = () => {},
) {
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Try using the Permissions API first
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        setShowPermissionWarning(result.state === 'denied');

        // Listen for permission changes
        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
          setShowPermissionWarning(result.state === 'denied');
        });
      } catch (error) {
        warnFn(`${warningContext}: Permissions API unavailable; falling back to getUserMedia`, error);
        // Fallback: try to get user media to check permission, but guard for test envs
        if (
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function'
        ) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              stream.getTracks().forEach((track) => track.stop());
              setCameraPermission('granted');
              setShowPermissionWarning(false);
            })
            .catch(() => {
              setCameraPermission('denied');
              setShowPermissionWarning(true);
            });
        } else {
          // No mediaDevices available (e.g., in headless test environment) — assume denied
          setCameraPermission('denied');
          setShowPermissionWarning(true);
        }
      }
    };

    checkCameraPermission();
  }, [setCameraPermission, setShowPermissionWarning, warningContext, warnFn]);
}
