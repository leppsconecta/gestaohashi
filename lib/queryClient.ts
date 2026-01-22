import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Optional: customize as needed
            staleTime: 1000 * 60 * 5, // 5 minutes default stale time
        },
    },
});
