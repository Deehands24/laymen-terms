"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { UserLaymenTermsSummary } from "@/lib/data-access"
import { formatDate } from "@/lib/utils"

interface ResultsTableProps {
  userId: number
}

export function ResultsTable({ userId }: ResultsTableProps) {
  const [translations, setTranslations] = useState<UserLaymenTermsSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/api/history?userId=${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch history")
        }

        setTranslations(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [userId])

  if (isLoading) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-white/30 border border-gray-100">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-white/30 border border-gray-100">
        <p className="text-red-500">{error}</p>
      </Card>
    )
  }

  if (translations.length === 0) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-white/30 border border-gray-100">
        <p className="text-center text-gray-500">No translation history found.</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/30 border border-gray-100">
      <div className="p-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-teal-600">Date</TableHead>
              <TableHead className="text-teal-600">Original Text</TableHead>
              <TableHead className="text-teal-600">Simplified Text</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.map((item) => (
              <TableRow key={item.laymenTermId} className="hover:bg-white/20 transition-colors">
                <TableCell className="font-medium">{formatDate(item.submittedAt)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{item.submittedText}</TableCell>
                <TableCell className="max-w-[300px] truncate">{item.explanation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
