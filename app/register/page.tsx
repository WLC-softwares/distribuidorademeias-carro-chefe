"use client";

import { Card, CardBody } from "@heroui/card";
import Link from "next/link";

import { AddressStep } from "./components/AddressStep";
import { DocumentStep } from "./components/DocumentStep";
import { PersonalInfoStep } from "./components/PersonalInfoStep";
import { useRegister } from "./hooks/useRegister";

export default function RegisterPage() {
  const registerHook = useRegister();

  const getStepTitle = () => {
    switch (registerHook.step) {
      case "personal":
        return "Informações Pessoais";
      case "document":
        return "Documentos";
      case "address":
        return "Endereço";
      default:
        return "Criar Conta";
    }
  };

  const getStepDescription = () => {
    switch (registerHook.step) {
      case "personal":
        return "Comece criando sua conta";
      case "document":
        return "Precisamos de alguns documentos";
      case "address":
        return "Onde você quer receber seus produtos";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Lado Esquerdo - Informações */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-12 flex-col justify-center border-r border-gray-200">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 shadow-lg">
              <span className="text-2xl font-bold text-white">DM</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Distribuidora Carro Chefe
            </span>
          </div>

          {/* Frase Principal */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Junte-se a nós e tenha acesso às melhores meias
            </h1>
            <p className="text-xl text-gray-700">
              Crie sua conta e comece a comprar com os melhores preços
            </p>
          </div>

          {/* Features */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <p className="text-gray-800 text-lg">Cadastro rápido e seguro</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <p className="text-gray-800 text-lg">
                Melhores preços do mercado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <p className="text-gray-800 text-lg">
                Entrega rápida e eficiente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 mb-3">
              <span className="text-2xl font-bold text-white">DM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Distribuidora de Meias
            </h1>
          </div>

          <Card className="shadow-xl border border-gray-100">
            <CardBody className="gap-6 p-8">
              {/* Header do Card */}
              <div className="mb-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  {getStepTitle()}
                </h2>
                <p className="text-gray-600 mt-2">{getStepDescription()}</p>

                {/* Progress Bar */}
                <div className="mt-4 flex gap-2">
                  <div
                    className={`h-1 flex-1 rounded-full ${registerHook.step === "personal" || registerHook.step === "document" || registerHook.step === "address" ? "bg-gray-900" : "bg-gray-200"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${registerHook.step === "document" || registerHook.step === "address" ? "bg-gray-900" : "bg-gray-200"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${registerHook.step === "address" ? "bg-gray-900" : "bg-gray-200"}`}
                  />
                </div>
              </div>

              {/* Steps */}
              {registerHook.step === "personal" && (
                <PersonalInfoStep
                  formData={registerHook.formData}
                  isConfirmPasswordVisible={
                    registerHook.isConfirmPasswordVisible
                  }
                  isPasswordVisible={registerHook.isPasswordVisible}
                  updateFormData={registerHook.updateFormData}
                  onSubmit={registerHook.handlePersonalInfoNext}
                  onToggleConfirmPasswordVisibility={
                    registerHook.toggleConfirmPasswordVisibility
                  }
                  onTogglePasswordVisibility={
                    registerHook.togglePasswordVisibility
                  }
                />
              )}

              {registerHook.step === "document" && (
                <DocumentStep
                  formData={registerHook.formData}
                  updateFormData={registerHook.updateFormData}
                  onBack={registerHook.handleBack}
                  onSubmit={registerHook.handleDocumentNext}
                />
              )}

              {registerHook.step === "address" && (
                <AddressStep
                  formData={registerHook.formData}
                  isLoading={registerHook.isLoading}
                  updateFormData={registerHook.updateFormData}
                  onBack={registerHook.handleBack}
                  onSubmit={registerHook.handleRegister}
                />
              )}

              {/* Error Message */}
              {registerHook.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {registerHook.error}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                className="text-gray-900 hover:text-gray-700 font-semibold"
                href="/login"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            © 2025 Distribuidora de Meias Carro Chefe - Todos os direitos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
}
