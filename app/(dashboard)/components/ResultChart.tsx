"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ResultChartProps {
  candidates: Array<{
    name: string;
    votes: number;
  }>;
  totalVotes: number;
}

const chartConfig = {
    votes: {
      label: "Votes",
      color: "#0000FF",
    },
    label: {
      color: "hsl(240, 100%, 50%)",
    },
  } satisfies ChartConfig;

function ResultChart({ candidates, totalVotes }: ResultChartProps) {
  const chartData = candidates.sort((a, b) => b.votes - a.votes)
    .map(candidate => ({
      name: candidate.name,
      votes: candidate.votes
    }))

  // Calculate maximum votes to set X-axis range
  const maxVotes = Math.max(...chartData.map(d => d.votes))

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Vote Distribution</CardTitle>
        <CardDescription>Total Votes: {totalVotes}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 50,
              left: 50,
              bottom: 20,
            }}
            height={chartData.length * 60}
            width={600}
          >
            <CartesianGrid horizontal strokeDasharray="3 3" />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
            />
            <XAxis 
              type="number"
              tickLine={false}
              axisLine={false}
              domain={[0, maxVotes]}
              ticks={Array.from({ length: maxVotes + 1 }, (_, i) => i)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="votes"
              fill="#475569"
              radius={[0, 4, 4, 0]}
              barSize={1000}
            >
              <LabelList
                dataKey="votes"
                position="right"
                offset={10}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing vote distribution across all candidates
        </div>
      </CardFooter>
    </Card>
  )
}

export default ResultChart