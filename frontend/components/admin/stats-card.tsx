'use client';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  footerText?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, footerText, trend }: StatsCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              {trend.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(description || footerText) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {description && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {description}{' '}
              {trend && (trend.isPositive ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />)}
            </div>
          )}
          {footerText && (
            <div className="text-muted-foreground">{footerText}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

