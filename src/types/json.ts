/**
 * Type definitions for JSON values.
 * These types can be used to properly type JSON data returned from APIs.
 */

// Basic JSON value types
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Use this type when dealing with a field that can contain any JSON value.
 * Example usage:
 * 
 * interface MyApiResponse {
 *   id: number;
 *   name: string;
 *   metadata: JsonValue; // Can be any valid JSON
 * }
 */ 