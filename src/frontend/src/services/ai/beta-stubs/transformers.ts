export async function pipeline() {
  return async () => {
    throw new Error(
      'Transformers.js is disabled for the March beta build. Re-enable local AI to use this provider.',
    );
  };
}
