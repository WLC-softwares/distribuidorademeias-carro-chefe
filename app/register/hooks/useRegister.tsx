import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerAction } from "@/controllers";

export type RegisterStep = "personal" | "document" | "address";

export interface RegisterData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Documents
  cpf: string;
  phone: string;
  // Address
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function useRegister() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("personal");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validatePersonalInfo = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");

      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");

      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");

      return false;
    }
    if (!formData.password) {
      setError("Password is required");

      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");

      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");

      return false;
    }

    return true;
  };

  const validateDocument = () => {
    if (!formData.cpf.trim()) {
      setError("CPF is required");

      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone is required");

      return false;
    }

    return true;
  };

  const validateAddress = () => {
    if (!formData.cep.trim()) {
      setError("ZIP code is required");

      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");

      return false;
    }
    if (!formData.number.trim()) {
      setError("Number is required");

      return false;
    }
    if (!formData.neighborhood.trim()) {
      setError("Neighborhood is required");

      return false;
    }
    if (!formData.city.trim()) {
      setError("City is required");

      return false;
    }
    if (!formData.state.trim()) {
      setError("State is required");

      return false;
    }

    return true;
  };

  const handlePersonalInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePersonalInfo()) {
      setStep("document");
    }
  };

  const handleDocumentNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDocument()) {
      setStep("address");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setIsLoading(true);
    setError("");

    try {
      // Prepare user data
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cpf: formData.cpf,
        addresses: [
          {
            cep: formData.cep,
            street: formData.address,
            number: formData.number,
            complement: formData.complement || undefined,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            principal: true,
          },
        ],
      };

      // Register user
      const result = await registerAction(userData);

      if (result.success) {
        // Automatic login after registration
        const loginResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginResult?.error) {
          // If there's a login error, redirect to login page
          router.push("/login");
        } else {
          // Successful login, redirect to home
          router.push("/");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error creating account. Please try again.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "document") {
      setStep("personal");
    } else if (step === "address") {
      setStep("document");
    }
  };

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return {
    // State
    step,
    formData,
    isPasswordVisible,
    isConfirmPasswordVisible,
    error,
    isLoading,
    // Functions
    updateFormData,
    handlePersonalInfoNext,
    handleDocumentNext,
    handleRegister,
    handleBack,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
}
