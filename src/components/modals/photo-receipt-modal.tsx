"use client"

import React, { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, RotateCcw, Download, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PhotoReceiptData) => Promise<void>
}

interface PhotoReceiptData {
  paymentId: string
  receiptNumber: string
  photoFile: File
  notes?: string
  amount: number
  paymentMethod: string
  captureDate: Date
}

interface Payment {
  id: string
  receiptNumber: string
  studentName: string
  amount: number
  paymentDate: string
  paymentMethod: string
}

export default function PhotoReceiptModal({ isOpen, onClose, onSubmit }: PhotoReceiptModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock payments data - in real app, this would come from API
  const payments: Payment[] = [
    {
      id: '1',
      receiptNumber: 'RCP-2024-001',
      studentName: 'John Doe',
      amount: 15000,
      paymentDate: '2024-09-15',
      paymentMethod: 'Mobile Money'
    },
    {
      id: '2',
      receiptNumber: 'RCP-2024-002',
      studentName: 'Sarah Smith',
      amount: 16000,
      paymentDate: '2024-09-10',
      paymentMethod: 'Bank Transfer'
    }
  ]

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCaptureMode('upload')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' })
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(blob))
            stopCamera()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }, [stopCamera])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPayment || !photoFile) {
      return
    }

    setIsLoading(true)
    try {
      const payment = payments.find(p => p.id === selectedPayment)
      if (!payment) throw new Error('Payment not found')

      const photoReceiptData: PhotoReceiptData = {
        paymentId: selectedPayment,
        receiptNumber: payment.receiptNumber,
        photoFile,
        notes,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        captureDate: new Date()
      }

      await onSubmit(photoReceiptData)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error saving photo receipt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedPayment('')
    setPhotoFile(null)
    setPhotoPreview('')
    setNotes('')
    setCaptureMode('camera')
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
    resetForm()
  }

  // Start camera when modal opens in camera mode
  React.useEffect(() => {
    if (isOpen && captureMode === 'camera') {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, captureMode, startCamera, stopCamera])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Photo Receipt Capture
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment</h3>
            <div>
              <Label htmlFor="payment">Payment Receipt *</Label>
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment receipt" />
                </SelectTrigger>
                <SelectContent>
                  {payments.map((payment) => (
                    <SelectItem key={payment.id} value={payment.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{payment.receiptNumber}</span>
                        <span className="text-sm text-gray-500">
                          {payment.studentName} - {payment.paymentMethod}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Photo Capture */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capture Receipt Photo</h3>
            
            {/* Capture Mode Toggle */}
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={captureMode === 'camera' ? 'default' : 'outline'}
                onClick={() => setCaptureMode('camera')}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </Button>
              <Button
                type="button"
                variant={captureMode === 'upload' ? 'default' : 'outline'}
                onClick={() => setCaptureMode('upload')}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
            </div>

            {/* Camera Capture */}
            {captureMode === 'camera' && (
              <div className="space-y-4">
                {!photoPreview ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto border rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!stream}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startCamera}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry Camera
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={photoPreview}
                      alt="Captured receipt"
                      className="max-w-md mx-auto border rounded-lg"
                    />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhotoFile(null)
                          setPhotoPreview('')
                          startCamera()
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retake Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* File Upload */}
            {captureMode === 'upload' && (
              <div className="space-y-4">
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">
                          Click to upload
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <Input
                        id="photo-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={photoPreview}
                      alt="Uploaded receipt"
                      className="max-w-md mx-auto border rounded-lg"
                    />
                    <div className="flex justify-center mt-4 space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhotoFile(null)
                          setPhotoPreview('')
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Photo Preview */}
            {photoPreview && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Photo captured successfully. You can add notes below before saving.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Notes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this receipt..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedPayment || !photoFile}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Photo Receipt'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
