import { useState } from "react";

export type LoginStep = "email" | "password";

export function useLogin() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("password");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de login aqui
    // console.log("Login:", { email, password });
  };

  const handleGoogleLogin = () => {
    // Lógica para login com Google
    // console.log("Login com Google");
  };

  const handleChangeAccount = () => {
    setStep("email");
    setPassword("");
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return {
    // Estado
    step,
    email,
    password,
    isVisible,
    // Setters
    setEmail,
    setPassword,
    // Handlers
    handleContinue,
    handleLogin,
    handleGoogleLogin,
    handleChangeAccount,
    toggleVisibility,
  };
}
