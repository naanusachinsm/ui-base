import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingUp } from "@tabler/icons-react";

const Analytics = () => {
  return (
    <>
      {/* Revenue Analytics and Recent Sales */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed revenue breakdown and trends over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Monthly Revenue
                    </p>
                    <p className="text-xl font-bold">$45,231.89</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <IconTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+20.1%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Order Value
                    </p>
                    <p className="text-xl font-bold">$89.45</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <IconTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12.3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-xl font-bold">1,234</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <IconTrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+8.7%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Latest transactions and customer activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[
                  {
                    name: "Olivia Martin",
                    email: "olivia.martin@email.com",
                    amount: "+$1,999.00",
                    time: "2 hours ago",
                  },
                  {
                    name: "Jackson Lee",
                    email: "jackson.lee@email.com",
                    amount: "+$39.00",
                    time: "4 hours ago",
                  },
                  {
                    name: "Isabella Nguyen",
                    email: "isabella.nguyen@email.com",
                    amount: "+$299.00",
                    time: "6 hours ago",
                  },
                  {
                    name: "William Kim",
                    email: "will@email.com",
                    amount: "+$99.00",
                    time: "8 hours ago",
                  },
                  {
                    name: "Sofia Davis",
                    email: "sofia.davis@email.com",
                    amount: "+$39.00",
                    time: "12 hours ago",
                  },
                ].map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {sale.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {sale.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sale.email}
                      </p>
                    </div>
                    <div className="ml-3 font-medium text-green-600">
                      {sale.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Analytics;
