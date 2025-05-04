import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import toast from "react-hot-toast"

/**
 * Combines class names using clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copies text to clipboard
 */
export function copyToClipboard(text: string, silence = false) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (!silence) {
        toast.success("Copied to clipboard")
      }
    })
    .catch(() => {
      if (!silence) {
        toast.error("Failed to copy to clipboard")
      }
    })
}

/**
 * Generates a QR code URL
 */
export function generateQrCode(data: string): string {
  const size = "200x200"
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`
}

/**
 * Handles TRPC client errors and displays appropriate toast messages
 */
export function ClientTRPCErrorHandler(error: any) {
  if (error?.message) {
    toast.error(error.message)
  } else if ((error?.data as { code: string })?.code === "INTERNAL_SERVER_ERROR") {
    toast.error("We are facing some issues. Please try again later")
  } else if ((error?.data as { code: string })?.code === "BAD_REQUEST") {
    toast.error("Invalid request. Please try again later")
  } else if ((error?.data as { code: string })?.code === "UNAUTHORIZED") {
    toast.error("Unauthorized request. Please try again later")
  } else if ((error?.data as { code: string })?.code === "CONFLICT") {
    toast.error("A conflict occurred with your request. This may be a duplicate entry.")
  } else if ((error?.data as { code: string })?.code === "NOT_FOUND") {
    toast.error("Requested resource was not found")
  } else {
    toast.error("We are facing some issues! Please try again later")
  }
}

/**
 * Converts string to Pascal Case
 */
export const toPascalCase = (input: string): string => {
  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Parses and standardizes phone number format
 */
export const parsePhoneNumber = (phoneInput: string): string => {
  if (!phoneInput || typeof phoneInput !== 'string') {
    return ''
  }
  
  const input = phoneInput.trim()
  if (input === '') {
    return ''
  }
  
  // Remove any non-numeric characters except the leading +
  let cleanedInput = input.replace(/[^\d+]/g, "")
  
  // Handle the leading + if it exists
  if (cleanedInput.startsWith('+')) {
    // Keep the + but clean the rest
    cleanedInput = '+' + cleanedInput.substring(1).replace(/\D/g, "")
  } else {
    // No + prefix, just clean and add one
    cleanedInput = '+' + cleanedInput.replace(/\D/g, "")
  }
  
  // Ensure we have at least some digits
  if (cleanedInput.length <= 1) {
    return ''
  }
  
  return cleanedInput
}

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value
  const phoneNumber = value.replace(/[^\d]/g, "")
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 4) return phoneNumber
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`
  }
  return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`
}

/**
 * Formats number as currency
 */
export const formatMoney = (input: string): string => {
  if (!input) return ""
  let value = "$"
  const number = Number(input)
  const numberString = number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  value += numberString
  return value
}

/**
 * Shortens any address for display purposes
 * @param address The full address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Shortened address with ellipsis in the middle
 */
export const shortenAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return ''
  
  // Remove any protocol prefix (like http:// or addr:)
  const cleanAddress = address.includes(':') 
    ? address.split(':').pop() || ''
    : address
    
  if (cleanAddress.length <= startChars + endChars) {
    return cleanAddress
  }
  
  const start = cleanAddress.substring(0, startChars)
  const end = cleanAddress.substring(cleanAddress.length - endChars)
  
  return `${start}...${end}`
}
