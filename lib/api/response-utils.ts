import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API response interfaces
 */
export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Create a validation error response from ZodError
 */
export function createValidationErrorResponse(
  zodError: ZodError,
  message: string = 'Validation failed'
): NextResponse<ErrorResponse> {
  const details = zodError.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }))

  return createErrorResponse(
    message,
    400,
    {
      validationErrors: details,
      totalErrors: zodError.issues.length,
    }
  )
}

/**
 * Handle common API errors with appropriate responses
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createValidationErrorResponse(error)
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An internal error occurred'
    
    return createErrorResponse(message, 500)
  }

  // Handle string errors
  if (typeof error === 'string') {
    return createErrorResponse(error, 500)
  }

  // Generic fallback
  return createErrorResponse('An unexpected error occurred', 500)
}

/**
 * Wrapper for API route handlers that provides consistent error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<SuccessResponse<T>>>
) {
  return async (): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler()
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Common status codes for API responses
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Common response messages
 */
export const ResponseMessages = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INTERNAL_ERROR: 'An internal error occurred',
} as const