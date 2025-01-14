'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase' // Replace with your Firestore setup file
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

export function LeaderboardView() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const totalPages = Math.ceil(leaderboardData.length / rowsPerPage)

  // Fetch data from Firestore
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'recognition'),
          orderBy('totalPoints', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map((doc, index) => ({
          ...doc.data(),
          rank: index + 1, // Add rank based on order
          id: doc.id, // Include Firestore document ID
        }))
        setLeaderboardData(data)
      } catch (err) {
        setError('Failed to fetch leaderboard data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboardData()
  }, [])

  const toggleRowExpansion = (moodleId) => {
    setExpandedRows((prevExpandedRows) => {
      const newExpandedRows = new Set(prevExpandedRows)
      if (newExpandedRows.has(moodleId)) {
        newExpandedRows.delete(moodleId)
      } else {
        newExpandedRows.add(moodleId)
      }
      return newExpandedRows
    })
  }

  const paginatedData = leaderboardData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  if (loading) return <div>Loading leaderboard...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-yellow-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">GDGoC APSIT Leaderboard</h1>
          <p className="text-xl mb-8">Celebrating excellence and contributions in our tech community</p>
        </div>
      </section>

      {/* Top 3 Podium */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Top 3 Active Members</h2>
        <div className="flex justify-center items-end space-x-4 mb-12">
          {leaderboardData.slice(0, 3).map((participant, index) => (
            <div
              key={participant.moodleId}
              className={`flex flex-col items-center p-4 rounded-t-lg ${
                index === 0 ? 'bg-yellow-400 h-40' :
                index === 1 ? 'bg-yellow-300 h-36' :
                'bg-yellow-200 h-32'
              }`}
            >
              <div className="text-4xl font-bold mb-2">{index + 1}</div>
              <div className="text-xl font-semibold text-center">{participant.name}</div>
              <div className="text-lg">{participant.totalPoints} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>GDGoC APSIT Leaderboard</CardTitle>
            <CardDescription>Top contributors in our community</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Leaderboard as of {new Date().toLocaleDateString()}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Moodle ID</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="w-[100px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((participant) => (
                  <>
                    <TableRow
                      key={participant.moodleId}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <TableCell className="font-medium">{participant.rank}</TableCell>
                      <TableCell>{participant.name}</TableCell>
                      <TableCell>{participant.moodleId}</TableCell>
                      <TableCell className="text-right">{participant.totalPoints}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(participant.moodleId)}
                        >
                          {expandedRows.has(participant.moodleId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(participant.moodleId) && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="p-4 bg-gray-50">
                            <h4 className="font-semibold mb-2">Event Participation:</h4>
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left">Event Name</th>
                                  <th className="text-left">Date</th>
                                  <th className="text-right">Points</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participant.events.map((event, index) => (
                                  <tr key={index}>
                                    <td>{event.name}</td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="text-right font-medium">{event.points} points</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <section className="bg-yellow-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Mark?</h2>
          <p className="text-xl mb-8">Join GDGoC APSIT and start your journey towards recognition!</p>
          <Button size="lg" variant="secondary" >
            <Link href="https://gdg.community.dev/gdg-on-campus-ap-shah-institute-of-technology-thane-india/">Get Involved</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
