import { QueryClient, QueryClientProvider } from "react-query";

export const queryClient = new QueryClient();

export function ReactQueryProvider({ children }:any) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools /> */}
      {children}
    </QueryClientProvider>
  );
}
