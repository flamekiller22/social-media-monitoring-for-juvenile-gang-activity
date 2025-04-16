/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

import { fetchCategorisedPosts, fetchCategorisedPostsStats } from "../actions";
import { useEffect, useState } from "react";
import Image from "next/image";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]



const recentData = [
  { id: 1, name: "Event 1", status: "Active", timestamp: "2023-04-01 10:00:00" },
  { id: 2, name: "Event 2", status: "Inactive", timestamp: "2023-04-01 11:30:00" },
  { id: 3, name: "Event 3", status: "Active", timestamp: "2023-04-01 12:45:00" },
  { id: 4, name: "Event 4", status: "Active", timestamp: "2023-04-01 14:15:00" },
  { id: 5, name: "Event 5", status: "Inactive", timestamp: "2023-04-01 16:00:00" },
  { id: 6, name: "Event 6", status: "Active", timestamp: "2023-04-01 10:00:00" },
  { id: 7, name: "Event 7", status: "Inactive", timestamp: "2023-04-01 11:30:00" },
  { id: 8, name: "Event 8", status: "Active", timestamp: "2023-04-01 12:45:00" },
  { id: 9, name: "Event 9", status: "Active", timestamp: "2023-04-01 14:15:00" },
  { id: 10, name: "Event 10", status: "Inactive", timestamp: "2023-04-01 16:00:00" },
]

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [sus, setSus] = useState<number>(10);
  // const [norm, setNorm] = useState<number>(20);
  const [pieChartData, setPieChartData] = useState<any>([
    { name: "Suspicious Posts", value: 0 },
    { name: "Normal Posts", value: 0 },
  ]);

  useEffect(() => {
    const f = async () => {
      const p = await fetchCategorisedPostsStats();
      setPosts(JSON.parse(p.posts))
      setLoading(false);
      setPieChartData([
        { name: "Suspicious Posts", value: p.sus },
        { name: "Normal Posts", value: p.norm },
      ])
    }
    f()
  }, [])

  // posts.forEach(post => {
  //   if (post.final_risk_score > 1) {
  //     setSus(sus + 1)
  //   } else {
  //     setNorm(norm + 1)
  //   }
  // })
  // // console.log(posts)
  // setLoading(false)
  // setPieChartData([
  //   { name: "Suspicious Posts", value: sus },
  //   { name: "Normal Posts", value: norm },
  // ])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6 mb-6">
        {["All Time", "This Week", "Today"].map((index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{index}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((data, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={data.name} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {/* <TableHead>Username</TableHead> */}
                <TableHead>Post Link</TableHead>
                <TableHead>Post Caption</TableHead>
                <TableHead>Post Preview</TableHead>
                <TableHead>Suspicious</TableHead>
                <TableHead>Reasoning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.toReversed().slice(2).map((post, i) => (
                <TableRow key={i}>
                  <TableCell>{i+1}</TableCell>
                  {/* <TableCell>{post.userProfile}</TableCell> */}
                  <TableCell>
                    <a  className="text-blue-600 hover:underline" href={post.postUrl} target="_blank">Post Link</a>
                  </TableCell>
                  <TableCell style={{ maxWidth: "15rem" }}>{post.captionText.substring(0, 150)}</TableCell>
                  <TableCell>
                    <div>
                      <Image src={post.postImgUrl} alt="" width="100" height="100"  />
                    </div>
                  </TableCell>
                  <TableCell>{post.final_risk_score > 5 ? "Yes" : "No"}</TableCell>
                  <TableCell style={{ maxWidth: "20rem" }}>{post.reasoning}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

