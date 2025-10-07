/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
}

export const initializeGoogleSignIn = (
  clientId: string,
  onSuccess: (response: GoogleCredentialResponse) => void
) => {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    throw new Error("Google Identity Services not loaded");
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        console.log("Google Sign-In successful:", response);
        onSuccess(response);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    console.log("Google Sign-In initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Google Sign-In:", error);
    throw error;
  }
};

export const renderGoogleButton = (
  elementId: string
) => {
  if (!window.google) {
    console.error("Google Identity Services not loaded");
    return;
  }

  const buttonElement = document.getElementById(elementId);
  if (!buttonElement) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  window.google.accounts.id.renderButton(buttonElement, {
    theme: "outline",
    size: "large",
    width: "100%",
  });
};

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    
    document.head.appendChild(script);
  });
};