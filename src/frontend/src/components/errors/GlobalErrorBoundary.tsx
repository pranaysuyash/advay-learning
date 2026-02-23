import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundaryInner extends Component<Props & { navigate: ReturnType<typeof useNavigate> }, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in global error boundary:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.navigate('/');
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border-4 border-red-100">
                        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl" role="img" aria-label="error">
                                Oops
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                            Oops! Something went wrong.
                        </h1>

                        <p className="text-gray-600 mb-8">
                            We encountered an unexpected error. Please return home and try again.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs bg-gray-100 p-4 rounded mb-8 overflow-auto max-h-40 text-red-600">
                                {this.state.error.message}
                            </pre>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="bg-primary text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all w-full"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrap with router hook
export function GlobalErrorBoundary(props: Props) {
    const navigate = useNavigate();
    return <GlobalErrorBoundaryInner {...props} navigate={navigate} />;
}
