"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
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
  BatchFormData,
} from "@/hooks/useFormValidation";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { uploadImage, uploadBatchMetadata, createBatchMetadata, formatIPFSError } from "@/lib/ipfs";
import { getUserMessage, getErrorType, isRecoverableError, getSuggestedAction } from "@/lib/errors";
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
      handleSubmit(new Event("submit") as any);
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">Mint Batch NFT</h1>
          <p className="text-muted mb-8">Create a new batch NFT with product metadata</p>

          {!wallet.isConnected || !wallet.isCorrectNetwork ? (
            <WalletConnect />
          ) : (
            <>
              {status === "success" && tokenId ? (
                <div className="space-y-4">
                  <Alert
                    type="success"
                    title="Batch Minted Successfully"
                    message={`Token ID: ${tokenId}\nTransaction: ${result.hash}`}
                    dismissible={false}
                  />
                  <button
                    onClick={() => {
                      reset();
                      setFormData({
                        batchName: "",
                        description: "",
                        origin: "",
                        material: "",
                        productionDate: "",
                        image: null,
                      });
                      setLastMetadataURI(null);
                    }}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Mint Another Batch
                  </button>
                </div>
              ) : status === "error" ? (
                <div className="space-y-4">
                  <Alert
                    type="error"
                    title="Minting Failed"
                    message={result.error || "Unknown error occurred"}
                    dismissible={true}
                    onDismiss={reset}
                  />
                  {suggestedAction && (
                    <Alert
                      type="info"
                      title="Suggested Action"
                      message={suggestedAction}
                      dismissible={false}
                    />
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        reset();
                        setSuggestedAction(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Clear & Start Over
                    </button>
                    {lastMetadataURI && (
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
                      >
                        {isRetrying ? <LoadingSpinner size="sm" /> : "Retry Transaction"}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Batch Name */}
                  <div>
                    <label className="block font-semibold mb-2">Batch Name *</label>
                    <input
                      type="text"
                      name="batchName"
                      value={formData.batchName}
                      onChange={handleInputChange}
                      placeholder="e.g., Handwoven Cotton Shawl"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                        errors.batchName ? "border-error" : "border-gray-300 focus:border-primary"
                      }`}
                    />
                    {errors.batchName && <p className="text-error text-sm mt-1">{errors.batchName}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the batch and its characteristics (min 10 characters)"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none min-h-24 ${
                        errors.description ? "border-error" : "border-gray-300 focus:border-primary"
                      }`}
                    ></textarea>
                    {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Origin and Material */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2">Origin *</label>
                      <input
                        type="text"
                        name="origin"
                        value={formData.origin}
                        onChange={handleInputChange}
                        placeholder="e.g., Odisha, India"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                          errors.origin ? "border-error" : "border-gray-300 focus:border-primary"
                        }`}
                      />
                      {errors.origin && <p className="text-error text-sm mt-1">{errors.origin}</p>}
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Material *</label>
                      <input
                        type="text"
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        placeholder="e.g., 100% Cotton"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                          errors.material ? "border-error" : "border-gray-300 focus:border-primary"
                        }`}
                      />
                      {errors.material && <p className="text-error text-sm mt-1">{errors.material}</p>}
                    </div>
                  </div>

                  {/* Production Date */}
                  <div>
                    <label className="block font-semibold mb-2">Production Date *</label>
                    <input
                      type="date"
                      name="productionDate"
                      value={formData.productionDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                        errors.productionDate ? "border-error" : "border-gray-300 focus:border-primary"
                      }`}
                    />
                    {errors.productionDate && <p className="text-error text-sm mt-1">{errors.productionDate}</p>}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block font-semibold mb-2">Product Image *</label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      errors.image ? "border-error" : "border-gray-300"
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-input"
                      />
                      <label htmlFor="image-input" className="cursor-pointer">
                        {formData.image ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>✓</span>
                            <span>{formData.image.name}</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-600">Click to upload image</p>
                            <p className="text-sm text-muted">JPEG, PNG, GIF, or WebP (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.image && <p className="text-error text-sm mt-1">{errors.image}</p>}
                  </div>

                  {/* Progress Bar */}
                  {status === "pending" && uploadProgress > 0 && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted mt-2">
                        {uploadProgress}% - {uploadProgress < 50 ? "Uploading to IPFS..." : "Minting NFT..."}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "pending" || contractLoading || isRetrying}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {status === "pending" || isRetrying ? (
                      <>
                        <LoadingSpinner size="sm" />
                        {isRetrying ? "Retrying..." : "Processing..."}
                      </>
                    ) : (
                      "Mint Batch"
                    )}
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
