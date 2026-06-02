import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, finalize, tap, throwError, timeout, TimeoutError } from "rxjs";
import { inject } from "@angular/core";
import { ToastService } from "../services/toast/toast.service"; 
import { LoadingService } from "../services/loading/loading.service";

/**
 * Global API Interceptor
 * -----------------------------------------------------------------------------------
 * Central orchestrator for HTTP lifecycle management:
 * 1. Global Loading State (LoadingService).
 * 2. Automated Notification Dispatch (ToastService).
 * 3. Global Error Handling & Timeout Management.
 * 4. URL Normalization.
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
                toastService.warning(errorMessage);
            } else if (error.status === 0) {
                errorMessage = 'No internet connection detected. Please check your network.';
                toastService.error(errorMessage);
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