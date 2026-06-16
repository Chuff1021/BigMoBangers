import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByPhone } from "@/lib/api";

/**
 * Order history for the storefront. In MVP a customer looks up their orders by
 * phone number — pass an empty string to keep the query disabled until entered.
 */
export function useOrders(phone: string) {
  return useQuery({
    queryKey: ["orders", phone],
    queryFn: () => fetchOrdersByPhone(phone),
    enabled: phone.trim().length >= 7,
  });
}
