"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
}

const datePresets = [
  {
    label: "Hoje",
    value: "today",
    getRange: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 7 dias",
    value: "last-7-days",
    getRange: () => ({
      from: addDays(new Date(), -6),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 15 dias",
    value: "last-15-days",
    getRange: () => ({
      from: addDays(new Date(), -14),
      to: new Date(),
    }),
  },
  {
    label: "Último mês",
    value: "last-month",
    getRange: () => ({
      from: addDays(new Date(), -30),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 3 meses",
    value: "last-3-months",
    getRange: () => ({
      from: addDays(new Date(), -90),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 6 meses",
    value: "last-6-months",
    getRange: () => ({
      from: addDays(new Date(), -180),
      to: new Date(),
    }),
  },
  {
    label: "Último ano",
    value: "last-year",
    getRange: () => ({
      from: addDays(new Date(), -365),
      to: new Date(),
    }),
  },
]

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "Selecione o período",
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date)

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    onDateChange?.(range)
  }

  const handlePresetSelect = (presetValue: string) => {
    if (presetValue === "custom") {
      return
    }
    
    const preset = datePresets.find(p => p.value === presetValue)
    if (preset) {
      const range = preset.getRange()
      handleDateSelect(range)
    }
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder
    }

    if (!range.to) {
      return format(range.from, "dd/MM/yyyy", { locale: ptBR })
    }

    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "dd/MM/yyyy", { locale: ptBR })
    }

    return `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(
      range.to,
      "dd/MM/yyyy",
      { locale: ptBR }
    )}`
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(selectedRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="flex flex-col border-r">
              <div className="p-3">
                <Select onValueChange={handlePresetSelect}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    {datePresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 pt-0">
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => handlePresetSelect(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedRange?.from}
                selected={selectedRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR}
                className="rounded-md"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
