export class AuthError extends Error {
  type: string;

  constructor(type: string, message?: string) {
    super(message || `Authentication error: ${type}`);
    this.type = type;
    this.name = "AuthError";
  }
}

// Mock auth function - removed duplicate definition
export const auth = async () => {
  // Return a mock session object
  return {
    user: {
      id: "dummy-user-id",
      email: "frontend-dev@example.com",
      name: "Frontend Developer"
    }
  };
};

// Mock signIn function
export async function signIn(provider: string, credentials?: any): Promise<void> {
  // For testing successful login, just return
  // To test failing login, uncomment the lines below

  // if (credentials?.get("email") === "fail@example.com") {
  //   throw new AuthError("CredentialsSignin", "Invalid credentials");
  // }

  console.log(`Mock signIn called with provider: ${provider}`);
  return Promise.resolve();
}

// Mock signOut function
export async function signOut({ redirectTo }: { redirectTo?: string } = {}): Promise<void> {
  console.log(`Mock signOut called${redirectTo ? `, would redirect to: ${redirectTo}` : ''}`);

  // If you want to actually perform the redirect during testing:
  // if (redirectTo && typeof window !== 'undefined') {
  //   window.location.href = redirectTo;
  // }

  return Promise.resolve();
}