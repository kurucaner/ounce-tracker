/**
 * Shared utility functions for the OunceTracker application
 */

import { Metal } from '../types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Calculate the premium percentage over spot price
 * @param productPrice - The price of the product per ounce
 * @param spotPrice - The current spot price per ounce
 * @returns Premium as a percentage
 */
export const calculatePremium = (productPrice: number, spotPrice: number): number => {
  if (spotPrice === 0) return 0;
  return ((productPrice - spotPrice) / spotPrice) * 100;
};

/**
 * Calculate price per ounce
 * @param totalPrice - Total price of the product
 * @param weight - Weight in troy ounces
 * @returns Price per ounce
 */
export const calculatePricePerOunce = (totalPrice: number, weight: number): number => {
  if (weight === 0) return 0;
  return totalPrice / weight;
};

/**
 * Format price as USD currency
 * @param price - Price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format percentage
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get metal display name
 * @param metal - Metal enum value
 * @returns Human-readable metal name
 */
export const getMetalDisplayName = (metal: Metal): string => {
  const names: Record<Metal, string> = {
    [Metal.GOLD]: 'Gold',
    [Metal.SILVER]: 'Silver',
    [Metal.PLATINUM]: 'Platinum',
    [Metal.PALLADIUM]: 'Palladium',
  };
  return names[metal];
};

/**
 * Delay execution for a specified duration
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if a date is within the last N minutes
 * @param date - Date to check
 * @param minutes - Number of minutes
 * @returns True if the date is within the last N minutes
 */
export const isWithinMinutes = (date: Date, minutes: number): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes <= minutes;
};

/**
 * Merge class names
 * @param inputs - Class names to merge
 * @returns Merged class names
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
