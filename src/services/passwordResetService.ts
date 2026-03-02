/**
 * Password Reset API Service
 * Handles all API calls for forgot password and password reset functionality
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  message: string;
  email?: string;
  userName?: string;
}

export const passwordResetService = {
  /**
   * Request password reset email
   * @param email - User's email address
   * @returns Promise with success message
   */
  async forgotPassword(payload: ForgotPasswordPayload) {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  /**
   * Reset password using token
   * @param payload - Reset password payload with token, email, and new password
   * @returns Promise with success message
   */
  async resetPassword(payload: ResetPasswordPayload) {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  /**
   * Verify reset token validity
   * @param token - Reset token from email link
   * @param email - User's email address
   * @returns Promise with token validity and user information
   */
  async verifyResetToken(
    token: string,
    email: string
  ): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(
          token
        )}&email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          message: data.message || "Invalid or expired token",
        };
      }

      return {
        valid: true,
        message: data.message,
        email: data.email,
        userName: data.userName,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return {
        valid: false,
        message: "Error verifying token",
      };
    }
  },

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation status and requirements
   */
  validatePassword(password: string) {
    const requirements = {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const strength = score <= 1 ? "weak" : score <= 2 ? "fair" : score <= 3 ? "good" : "strong";

    return {
      isValid: password.length >= 6,
      strength,
      score,
      requirements,
    };
  },

  /**
   * Check if passwords match
   * @param password1 - First password
   * @param password2 - Second password
   * @returns Boolean indicating if passwords match
   */
  passwordsMatch(password1: string, password2: string): boolean {
    return password1 === password2 && password1.length > 0;
  },
};

export default passwordResetService;
