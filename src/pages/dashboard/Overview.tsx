import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
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
