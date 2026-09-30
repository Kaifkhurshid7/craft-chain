"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { WalletConnect } from "@/components/WalletConnect";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/context/ContractContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { uploadStepData } from "@/lib/ipfs";
import { hashStepData } from "@/lib/blockchain";
import { RecordStepFormData, STEP_TYPES } from "@/types";

export default function RecordStepPage() {
  const { wallet } = useWallet();
  const { recordStep, isLoading: contractLoading } = useContract();
  const { errors, addError, removeError, clearErrors } = useFormValidation();
  const { status, result, setLoading, setSuccess, setError: setTxError, reset } = useTransactionStatus();

  const [formData, setFormData] = useState<RecordStepFormData>({
    tokenId: 0,
    stepType: "Processing",
    description: "",
    location: "",
    date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tokenId" ? parseInt(value) || 0 : value,
    }));
    removeError(name);
  };

  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!formData.tokenId || formData.tokenId <= 0) {
      addError("tokenId", "Valid token ID is required");
      isValid = false;
    }
    if (!formData.description.trim()) {
      addError("description", "Description is required");
      isValid = false;
    }
    if (!formData.location.trim()) {
      addError("location", "Location is required");
      isValid = false;
    }
    if (!formData.date) {
      addError("date", "Date is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading();

    try {
      // Upload step data to IPFS
      const stepDataResponse = await uploadStepData({
        stepType: formData.stepType as any,
        description: formData.description,
        location: formData.location,
        date: formData.date,
      });

      // Calculate hash
      const stepHash = hashStepData({
        stepType: formData.stepType,
        description: formData.description,
        location: formData.location,
        date: formData.date,
      });

      // Record on-chain
      const txHash = await recordStep(formData.tokenId, stepHash);

      if (txHash) {
        setSuccess(txHash);
        setFormData({
          tokenId: 0,
          stepType: "Processing",
          description: "",
          location: "",
          date: "",
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setTxError(err.message || "Failed to record step");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="container max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">Record Processing Step</h1>
          <p className="text-muted mb-8">Document supply chain events and transitions</p>

          {!wallet.isConnected || !wallet.isCorrectNetwork ? (
            <WalletConnect />
          ) : (
            <>
              {status === "success" ? (
                <Alert
                  type="success"
                  title="Step Recorded Successfully"
                  message={`Transaction: ${result.hash?.slice(0, 10)}...`}
                  dismissible={true}
                  onDismiss={reset}
                />
              ) : status === "error" ? (
                <Alert
                  type="error"
                  title="Recording Failed"
                  message={result.error || "Unknown error"}
                  dismissible={true}
                  onDismiss={reset}
                />
              ) : null}

              <div className="bg-white rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Token ID */}
                  <div>
                    <label className="block font-semibold mb-2">Batch Token ID</label>
                    <input
                      type="number"
                      name="tokenId"
                      value={formData.tokenId || ""}
                      onChange={handleInputChange}
                      placeholder="Enter token ID"
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    />
                    {errors.tokenId && <p className="text-error text-sm mt-1">{errors.tokenId}</p>}
                  </div>

                  {/* Step Type */}
                  <div>
                    <label className="block font-semibold mb-2">Step Type</label>
                    <select
                      name="stepType"
                      value={formData.stepType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    >
                      {STEP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what happened in this step"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary min-h-24"
                    ></textarea>
                    {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Location and Date */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Where did this occur?"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                      />
                      {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Date</label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                      />
                      {errors.date && <p className="text-error text-sm mt-1">{errors.date}</p>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "pending" || contractLoading}
                    className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    {status === "pending" ? <LoadingSpinner size="sm" /> : "Record Step"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
