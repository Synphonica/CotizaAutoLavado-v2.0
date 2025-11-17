/**
 * Supabase Client with Clerk Authentication
 * 
 * This client automatically attaches Clerk JWT tokens to all Supabase requests
 * using the 'supabase' template configured in Clerk.
 */

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

/**
 * Hook to get a Supabase client with Clerk authentication
 * 
 * @example
 * ```tsx
 * const supabase = useSupabaseClient();
 * const { data } = await supabase.from('bookings').select('*');
 * ```
 */
export function useSupabaseClient() {
    const { getToken } = useAuth();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                // Intercept all requests to add Clerk token
                fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
                    // Get Clerk token with Supabase template
                    const clerkToken = await getToken({ template: 'supabase' });

                    // Add Authorization header
                    const headers = new Headers(options?.headers);
                    if (clerkToken) {
                        headers.set('Authorization', `Bearer ${clerkToken}`);
                    }

                    return fetch(url, { ...options, headers });
                },
            },
        }
    );

    return supabase;
}

/**
 * Server-side Supabase client (for API routes and Server Components)
 * 
 * @param token - Clerk token obtained from getToken({ template: 'supabase' })
 */
export function createServerSupabaseClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        }
    );
}
