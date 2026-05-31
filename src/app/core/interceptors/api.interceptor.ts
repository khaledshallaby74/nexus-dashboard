import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, finalize, throwError } from "rxjs";
import { inject } from "@angular/core";
import { NotificationService } from "../services/notifications/notification.service";
import { LoadingService } from "../services/loading/loading.service";

/**
 * Functional Interceptor to handle API URL prefixing, global error handling, and core loading state.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Access the base API URL from environment configuration
    const baseUrl = environment.baseUrl;

    /**
     * We only want to prepend the baseUrl and add headers to actual API calls.
     * This prevents the interceptor from breaking i18n or local image loading.
     */
    if (req.url.includes('assets') || req.url.includes('i18n')) {
        return next(req);
    }

    // Inject NotificationService to display error toasts
    const notify = inject(NotificationService);
    
    // Inject LoadingService to centrally manage the active requests counter
    const loadingService = inject(LoadingService);

    // Increment the active requests counter immediately when a valid API request is initiated
    loadingService.show();

    /**
     * Clone the outgoing request and prepend the base URL.
     * Requests are immutable, so cloning is required to modify the URL.
     */
    const apiReq = req.clone({
        url: `${baseUrl}/${req.url}`
    });

    // Pass the cloned request to the next handler in the interceptor chain
    return next(apiReq).pipe(
        catchError((error) => {
            /**
             * Extract the error message. 
             * Priority: Backend custom message > General error message > Fallback string.
             */
            let errorMessage = error.error?.message || error.message || 'An unknown error occurred!';
            
            // Handle network connectivity issues (Status 0)
            if (error.status == 0) {
                errorMessage = 'Check your internet connection.';
            }
            
            // Handle server-side crashes where no specific message is returned
            if (error.status == 500 && (!error.error?.message || !error.message)) {
                errorMessage = 'Internal Server Error. Please try again later.';
            }
            
            // Display the formatted error message via the notification service
            notify.show(errorMessage);
            
            // Re-throw the error so it can be handled by the calling service if needed
            return throwError(() => error);
        }),
        /**
         * The finalize operator acts as a bulletproof safeguard against state bugs.
         * It is guaranteed to execute at the end of the request lifecycle,
         * regardless of whether the stream succeeded or encountered an error.
         */
        finalize(() => {
            // Decrement the active requests counter when the HTTP stream terminates
            loadingService.hide();
        })
    );
};