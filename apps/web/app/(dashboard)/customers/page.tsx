import { getCustomers } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CustomerRow } from "@/components/dashboard/customer-row";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const tenant = await getTenantFromRequest();
  const customers = await getCustomers(tenant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={{
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    totalOrders: c.totalOrders,
                    totalSpent: c.totalSpent,
                    lastOrderAt: c.lastOrderAt,
                  }}
                />
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No customers yet — they'll appear here after the first order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
