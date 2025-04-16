"use client";

import Image from "next/image";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  return (
    <div className="w-full flex justify-center">
      <div className="mt-0">
        <div
          className="w-screen relative"
          style={{ aspectRatio: "1600 / 1066" }}
        >
          <Image
            src="/1GeklLhCXUAALhfW.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}
