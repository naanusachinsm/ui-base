import { SectionCards } from "@/components/dashboard/section-cards";
import { DataTable } from "@/components/dashboard/data-table";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import dashboardData from "@/app/dashboard/data.json";

const Overview = () => {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={dashboardData} />
    </>
  );
};

export default Overview;
