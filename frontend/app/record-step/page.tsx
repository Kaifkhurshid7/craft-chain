"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import { StudioLayout, FieldLabel, FieldError } from "@/components/studio/StudioLayout";
import { TransactionPanel, SuccessCard } from "@/components/studio/TransactionPanel";
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

  const phase = status === "success" ? 3 : status === "pending" ? 1 : 0;
  const busy = status === "pending" || contractLoading;

  return (
    <StudioLayout>
      {!wallet.isConnected || !wallet.isCorrectNetwork ? (
        <WalletConnect />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:gap-16">
          <div>
            {status === "error" && (
              <div className="mb-8">
                <Alert
                  type="error"
                  title="Recording Failed"
                  message={result.error || "Unknown error"}
                  dismissible={true}
                  onDismiss={reset}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" aria-label="Record a journey step">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <FieldLabel>Token ID</FieldLabel>
                  <input
                    type="number"
                    name="tokenId"
                    value={formData.tokenId || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. 1"
                    min="1"
                    className={`field font-mono ${errors.tokenId ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.tokenId} />
                </div>

                <div>
                  <FieldLabel>Step Type</FieldLabel>
                  <div className="relative">
                    <select
                      name="stepType"
                      value={formData.stepType}
                      onChange={handleInputChange}
                      className="field appearance-none"
                    >
                      {STEP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute right-0 top-4 text-forest" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what happened to this batch..."
                    className={`field resize-none ${errors.description ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.description} />
                </div>

                <div>
                  <FieldLabel>Location</FieldLabel>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-0 top-4 text-forest" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, country or facility"
                      className={`field pl-7 ${errors.location ? "field-error" : ""}`}
                    />
                  </div>
                  <FieldError message={errors.location} />
                </div>

                <div>
                  <FieldLabel>Date</FieldLabel>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`field ${errors.date ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.date} />
                </div>
              </div>

              <button type="submit" disabled={busy} className="btn-primary">
                {status === "pending" ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Record Journey Step <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <TransactionPanel phase={phase} failed={status === "error"} />
            {status === "success" && (
              <SuccessCard
                title="Journey step recorded"
                rows={[{ label: "Transaction Hash", value: result.hash || "" }]}
              />
            )}
          </div>
        </div>
      )}
    </StudioLayout>
  );
}
