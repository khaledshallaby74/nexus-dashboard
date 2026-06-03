import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, finalize, tap, throwError, timeout, TimeoutError, retry, timer } from "rxjs";
import { inject } from "@angular/core";
import { ToastService } from "../services/toast/toast.service"; 
import { LoadingService } from "../services/loading/loading.service";

/**
 * Global Network Throttling State
 * -----------------------------------------------------------------------------------
 * Prevents continuous concurrent layout spamming by deduplicating multi-stream 
 * network failures (e.g., synchronous status 0 closures) into a single visual feedback node.
 */
let isNetworkErrorToastActive = false;

/**
 * Global API Interceptor
 * -----------------------------------------------------------------------------------
 * Central orchestrator for HTTP lifecycle management:
 * 1. Global Loading State (LoadingService).
 * 2. Automated Notification Dispatch (ToastService).
 * 3. Global Error Handling & Timeout Management.
 * 4. URL Normalization.
 * 5. Smart Exponential Backoff Retry Strategy.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const baseUrl = environment.baseUrl;

    // Skip interception for static assets and localization files
    if (req.url.includes('assets') || req.url.includes('i18n')) {
        return next(req);
    }

    const toastService = inject(ToastService);
    const loadingService = inject(LoadingService);

    loadingService.show();

    // Map relative paths to absolute environment-defined base URL
    const apiReq = req.clone({
        url: `${baseUrl}/${req.url}`
    });

    return next(apiReq).pipe(
        // 🔄 Smart Retry Pipeline: Backs off execution intervals gracefully to mitigate momentary offline drops
        retry({
            count: req.method === 'GET' ? 2 : 0, // Idempotent requests only; mutation methods avoid duplication targets
            delay: (error, retryCount) => {
                const backoffDelay = retryCount * 1500;
                console.warn(`[Network Retry] Attempt ${retryCount} for unified route: ${req.url}. Re-dispatching in ${backoffDelay}ms...`);
                return timer(backoffDelay);
            }
        }),

        // Enforce network strictness: 7s SLA for server responses
        timeout(7000), 

        /**
         * Success Pipeline:
         * Automated UI feedback for successful state mutations (POST, PUT, DELETE, PATCH).
         */
        tap((event) => {
            if (event instanceof HttpResponse) {
                const method = req.method;
                
                if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                    
                    // Priority 1: Backend-defined messages
                    if (event.body && typeof event.body === 'object' && 'message' in event.body) {
                        const msg = (event.body as any).message;
                        if (msg && typeof msg === 'string') {
                            toastService.success(msg);
                            return;
                        }
                    }

                    // Priority 2: Predictive entity naming (Heuristic approach)
                    const relativeUrl = req.url.replace(baseUrl, '').replace(/^\/+/, ''); 
                    const urlSegments = relativeUrl.split('/');
                    
                    let entityName = urlSegments[0] ? urlSegments[0].toLowerCase() : 'record';

                    // Plural to Singular normalization logic
                    if (entityName.includes('category') || entityName.endsWith('categories')) {
                        entityName = 'category';
                    } else if (entityName.endsWith('ies')) {
                        entityName = entityName.slice(0, -3) + 'y';
                    } else if (entityName.endsWith('s')) {
                        entityName = entityName.slice(0, -1);
                    }

                    const formattedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

                    // Dispatch centralized notification based on mutation type
                    const actionMap: Record<string, string> = {
                        'POST': 'created',
                        'PUT': 'updated',
                        'PATCH': 'updated',
                        'DELETE': 'deleted'
                    };
                    
                    toastService.success(`${formattedEntity} ${actionMap[method] || 'processed'} successfully!`);
                }
            }
        }),

        /**
         * Global Error Pipeline:
         * Standardizes cross-application error reporting and graceful termination.
         */
        catchError((error) => {
            let errorMessage = 'An unexpected error occurred!';

            if (error instanceof TimeoutError) {
                errorMessage = 'The connection timed out. Please check your internet speed.';
                
                // Deduplicate timeout alert streams
                if (!isNetworkErrorToastActive) {
                    isNetworkErrorToastActive = true;
                    toastService.warning(errorMessage);
                    setTimeout(() => isNetworkErrorToastActive = false, 4000);
                }
            } else if (error.status === 0) {
                errorMessage = 'No internet connection detected. Please check your network.';
                
                // Deduplicate structural status 0 offline loops
                if (!isNetworkErrorToastActive) {
                    isNetworkErrorToastActive = true;
                    toastService.error(errorMessage);
                    setTimeout(() => isNetworkErrorToastActive = false, 4000);
                }
            } else {
                errorMessage = error.error?.message || error.message || errorMessage;
                
                // Map common HTTP status codes to user-friendly messages
                const statusMap: Record<number, string> = {
                    500: 'Server error (500). Please try again later.',
                    404: 'Requested resource not found (404).',
                    401: 'Unauthorized session. Please login again.'
                };
                
                errorMessage = statusMap[error.status] || errorMessage;
                toastService.error(errorMessage);
            }

            return throwError(() => error);
        }),

        /**
         * Lifecycle cleanup: Ensures the global loading indicator state is always reset.
         */
        finalize(() => {
            loadingService.hide();
        })
    );
};