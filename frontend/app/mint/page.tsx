"use client";

import { useState, useCallback } from "react";
import { ArrowUpRight, FileImage, Hash, Upload } from "lucide-react";
import { StudioLayout, FieldLabel, FieldError } from "@/components/studio/StudioLayout";
import { TransactionPanel, SuccessCard } from "@/components/studio/TransactionPanel";
import { WalletConnect } from "@/components/WalletConnect";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/context/ContractContext";
import { 
  useFormValidation, 
  isValidImageFile,
  validateBatchForm,
  sanitizeString,
} from "@/hooks/useFormValidation";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { uploadBatchMetadata, createBatchMetadata } from "@/lib/ipfs";
import { getUserMessage, getSuggestedAction } from "@/lib/errors";
import { logError, logDebug } from "@/lib/errorLogger";
import { MintBatchFormData } from "@/types";

export default function MintPage() {
  const { wallet } = useWallet();
  const { mintBatch, isLoading: contractLoading } = useContract();
  const { errors, addError, removeError, clearErrors, setErrors } = useFormValidation();
  const { status, result, setLoading, setSuccess, setError: setTxError, reset } = useTransactionStatus();

  const [formData, setFormData] = useState<MintBatchFormData>({
    batchName: "",
    description: "",
    origin: "",
    material: "",
    productionDate: "",
    image: null,
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastMetadataURI, setLastMetadataURI] = useState<string | null>(null);
  const [suggestedAction, setSuggestedAction] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    removeError(name);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      if (!isValidImageFile(file)) {
        addError("image", "Invalid image file. Must be JPEG, PNG, GIF, or WebP and less than 5MB.");
      } else {
        removeError("image");
        setFormData((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateBatchForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    
    clearErrors();
    return true;
  }, [formData, setErrors, clearErrors]);

  const handleRetry = useCallback(async () => {
    if (!lastMetadataURI) {
      // If we don't have metadata URI, retry the whole process
      handleSubmit(new Event("submit") as unknown as React.FormEvent);
      return;
    }

    // Try to mint again with cached metadata
    setIsRetrying(true);
    setLoading();
    setSuggestedAction(null);

    try {
      logDebug("Retrying mint transaction with cached metadata", { metadataURI: lastMetadataURI });
      
      const txHash = await mintBatch(wallet.address!, lastMetadataURI);
      if (txHash) {
        setSuccess(txHash);
        setTokenId(1); // In real scenario, extract from logs
      }
    } catch (error: unknown) {
      logError("Retry mint failed", error);
      const message = getUserMessage(error);
      const action = getSuggestedAction(error);
      setTxError(message);
      setSuggestedAction(action || null);
    } finally {
      setIsRetrying(false);
    }
  }, [lastMetadataURI, mintBatch, wallet.address, setLoading, setSuccess, setTxError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading();
    setUploadProgress(0);
    setSuggestedAction(null);
    setLastMetadataURI(null);

    try {
      logDebug("Starting batch mint process");

      // Create and upload metadata
      setUploadProgress(25);
      logDebug("Creating batch metadata");
      const metadata = await createBatchMetadata(
        sanitizeString(formData.batchName),
        sanitizeString(formData.description),
        sanitizeString(formData.origin),
        sanitizeString(formData.material),
        formData.productionDate,
        formData.image!
      );

      setUploadProgress(50);
      logDebug("Uploading batch metadata to IPFS");
      const metadataResponse = await uploadBatchMetadata(metadata);
      const metadataURI = `ipfs://${metadataResponse.cid}`;
      setLastMetadataURI(metadataURI);

      setUploadProgress(75);
      logDebug("Minting batch NFT");

      // Mint batch
      const txHash = await mintBatch(wallet.address!, metadataURI);

      if (txHash) {
        setUploadProgress(100);
        setSuccess(txHash);
        setTokenId(1); // Placeholder - in real scenario, extract from logs
        logDebug("Batch minted successfully", { txHash });
      }
    } catch (error: unknown) {
      logError("Mint process failed", error);
      
      const message = getUserMessage(error);
      const action = getSuggestedAction(error);
      
      setTxError(message);
      setSuggestedAction(action || null);
      setUploadProgress(0);
    }
  };

  const phase = status === "success" ? 3 : status === "pending" && uploadProgress >= 75 ? 1 : 0;

  const resetAll = () => {
    reset();
    setSuggestedAction(null);
    setFormData({
      batchName: "",
      description: "",
      origin: "",
      material: "",
      productionDate: "",
      image: null,
    });
    setLastMetadataURI(null);
    setUploadProgress(0);
  };

  const busy = status === "pending" || contractLoading || isRetrying;

  return (
    <StudioLayout>
      {!wallet.isConnected || !wallet.isCorrectNetwork ? (
        <WalletConnect />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:gap-16">
          <div>
            {status === "error" && (
              <div className="mb-8 space-y-4">
                <Alert
                  type="error"
                  title="Minting Failed"
                  message={result.error || "Unknown error occurred"}
                  dismissible={true}
                  onDismiss={reset}
                />
                {suggestedAction && (
                  <Alert type="info" title="Suggested Action" message={suggestedAction} dismissible={false} />
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      reset();
                      setSuggestedAction(null);
                    }}
                    className="btn-outline flex-1"
                  >
                    Clear &amp; Start Over
                  </button>
                  {lastMetadataURI && (
                    <button onClick={handleRetry} disabled={isRetrying} className="btn-primary flex-1">
                      {isRetrying ? <LoadingSpinner size="sm" /> : "Retry Transaction"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" aria-label="Mint a new batch">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel>Batch Name</FieldLabel>
                  <input
                    type="text"
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleInputChange}
                    placeholder="e.g. Winter 2025 / Hand-thrown stoneware"
                    className={`field ${errors.batchName ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.batchName} />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell the story of this batch (min 10 characters)..."
                    className={`field resize-none ${errors.description ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.description} />
                </div>

                <div>
                  <FieldLabel>Origin</FieldLabel>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Region or workshop"
                    className={`field ${errors.origin ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.origin} />
                </div>

                <div>
                  <FieldLabel>Material</FieldLabel>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="Primary material"
                    className={`field ${errors.material ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.material} />
                </div>

                <div>
                  <FieldLabel>Production Date</FieldLabel>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={handleInputChange}
                    className={`field ${errors.productionDate ? "field-error" : ""}`}
                  />
                  <FieldError message={errors.productionDate} />
                </div>

                <div>
                  <FieldLabel>Image Upload</FieldLabel>
                  <label
                    htmlFor="image-input"
                    className={`mb-0 flex cursor-pointer items-center gap-3 border-b py-3 text-sm font-normal normal-case tracking-normal text-ink/60 hover:text-forest ${
                      errors.image ? "border-danger" : "border-forest/20"
                    }`}
                  >
                    <Upload size={16} />
                    <span>{formData.image?.name || "Choose a provenance image"}</span>
                  </label>
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <p className="mt-1 text-xs text-ink/50">JPEG, PNG, GIF or WebP, max 5MB</p>
                  <FieldError message={errors.image} />
                </div>
              </div>

              {status === "pending" && uploadProgress > 0 && (
                <div>
                  <div className="h-1 w-full bg-forest/10">
                    <div className="h-1 bg-forest transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-ink/60">
                    {uploadProgress}% - {uploadProgress < 75 ? "Uploading to IPFS..." : "Minting NFT..."}
                  </p>
                </div>
              )}

              <button type="submit" disabled={busy} className="btn-primary">
                {status === "pending" || isRetrying ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {isRetrying ? "Retrying..." : "Processing..."}
                  </>
                ) : (
                  <>
                    Mint Batch <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="border border-forest/15 bg-white/60 p-6 md:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Metadata</p>
                  <h2 className="mt-2 text-2xl">IPFS Preview</h2>
                </div>
                <FileImage size={20} strokeWidth={1.5} className="text-forest" />
              </div>
              <dl className="space-y-4 border-t border-forest/15 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Name</dt>
                  <dd className="text-right font-medium">{formData.batchName || "Untitled batch"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Origin</dt>
                  <dd className="text-right font-medium">{formData.origin || "Awaiting input"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">Image</dt>
                  <dd className="break-all text-right font-medium">{formData.image?.name || "Not attached"}</dd>
                </div>
              </dl>
              <div className="mt-6 flex items-center gap-2 border-t border-forest/15 pt-4 text-xs text-ink/60">
                <Hash size={14} className="text-brass" />
                <span>Stored on IPFS after minting</span>
              </div>
            </div>

            <TransactionPanel phase={phase} failed={status === "error"} />

            {status === "success" && tokenId && (
              <>
                <SuccessCard
                  title="Batch ready to trace"
                  rows={[
                    { label: "New Token ID", value: `#${tokenId}` },
                    { label: "Transaction Hash", value: result.hash || "" },
                  ]}
                />
                <button onClick={resetAll} className="btn-outline w-full">
                  Mint Another Batch
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </StudioLayout>
  );
}
