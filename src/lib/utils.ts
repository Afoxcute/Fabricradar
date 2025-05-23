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

/**
 * Combine a date object and a time string (HH:MM) into a single Date object
 */
export function combine2DateAndTime(date: Date, timeStr: string): Date {
  // Create a new date object to avoid mutation
  const combined = new Date(date);
  
  // Parse the time string (expected format: "HH:MM")
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Set hours and minutes
  combined.setHours(hours);
  combined.setMinutes(minutes);
  combined.setSeconds(0);
  combined.setMilliseconds(0);
  
  return combined;
}

/**
 * Formats a date as a relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

/**
 * Format/truncate an address for display
 * @param address The address to format
 * @param startLen Number of characters to show at start
 * @param endLen Number of characters to show at end
 * @returns Formatted address
 */
export function formatAddress(address: string, startLen = 4, endLen = 4): string {
  if (!address) return '';
  if (address.length <= startLen + endLen + 2) return address;
  
  return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
}
