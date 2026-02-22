import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  CameraCrashFallback,
  type CameraErrorKind,
} from './CameraCrashFallback';

export interface CameraErrorBoundaryProps {
  gameName: string;
  children: ReactNode;
  onRetry?: () => void;
  onFallbackMode?: () => void;
  showHomeAction?: boolean;
  onErrorClassified?: (
    kind: CameraErrorKind,
    error: Error,
    info: ErrorInfo,
  ) => void;
}

interface CameraErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  kind: CameraErrorKind;
}

function classifyCameraError(error: Error): CameraErrorKind {
  const message = error.message.toLowerCase();
  if (/(permission|denied|notallowed|notfound|camera)/.test(message)) {
    return 'permission';
  }
  if (/(mediapipe|initializ|model|landmarker)/.test(message)) {
    return 'init';
  }
  if (/(runtime|render|worker|frame)/.test(message)) {
    return 'runtime';
  }
  return 'unknown';
}

export class CameraErrorBoundary extends Component<
  CameraErrorBoundaryProps,
  CameraErrorBoundaryState
> {
  state: CameraErrorBoundaryState = {
    hasError: false,
    error: null,
    kind: 'unknown',
  };

  static getDerivedStateFromError(error: Error): CameraErrorBoundaryState {
    return {
      hasError: true,
      error,
      kind: classifyCameraError(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onErrorClassified?.(classifyCameraError(error), error, info);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, kind: 'unknown' });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <CameraCrashFallback
          gameName={this.props.gameName}
          errorKind={this.state.kind}
          message={this.state.error?.message}
          onRetry={this.handleRetry}
          onFallbackMode={this.props.onFallbackMode}
          showHomeAction={this.props.showHomeAction}
        />
      );
    }

    return this.props.children;
  }
}

export default CameraErrorBoundary;
