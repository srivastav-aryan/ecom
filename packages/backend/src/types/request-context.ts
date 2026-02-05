import pino from "pino";

/**
 * RequestContext carries request-scoped data through the service layer.
 * 
 * RULE: Every public service method MUST have `ctx?: RequestContext` as its last parameter.
 * This ensures we can add new request-scoped data without changing signatures.
 */
export interface RequestContext {
  /** Request-scoped logger with request ID correlation */
  logger?: pino.Logger;
  
  /** User agent string from request headers */
  deviceInfo?: string;
  
  /** Client IP address */
  ip?: string;
  
  /** Unique request ID for tracing */
  requestId?: string;
}
