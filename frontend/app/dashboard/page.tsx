import { AppLayout } from "@/components/shared/app-layout"
import { ChartAreaInteractive } from "@/components/template/chart-area-interactive"
import { DataTable } from "@/components/template/data-table"
import { SectionCards } from "@/components/template/section-cards"

import data from "./data.json"

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </AppLayout>
  )
}
