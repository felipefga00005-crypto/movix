import { AppLayout } from "@/components/shared/app-layout"
import { PdvSectionCards } from "@/components/pdv/pdv-section-cards"
import { PdvDataTable } from "@/components/pdv/pdv-data-table"
import { PdvChartInteractive } from "@/components/pdv/pdv-chart-interactive"

import data from "./data.json"

export default function PdvPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <PdvSectionCards />
        <div className="px-4 lg:px-6">
          <PdvChartInteractive />
        </div>
        <PdvDataTable data={data} />
      </div>
    </AppLayout>
  )
}
