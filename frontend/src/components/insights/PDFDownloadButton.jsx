import React, { useState } from 'react'
import { Download, FileText, Loader2, CheckCircle, Save, Cloud } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const PDFDownloadButton = ({ comparison, entityA, entityB }) => {
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateEnhancedPDF = async (saveToBackend = false) => {
    setGenerating(true)
    if (saveToBackend) setSaving(true)
    setProgress(10)

    const toastId = saveToBackend ? 
      toast.loading('Generating and saving PDF report...') : 
      toast.loading('Generating PDF report...')

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPosition = margin

      // ✅ Helper function to add new page if needed
      const checkPageSpace = (requiredHeight, currentY) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage()
          return margin
        }
        return currentY
      }

      // ✅ Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(text, maxWidth)
        lines.forEach((line, index) => {
          pdf.text(line, x, y + (index * (fontSize * 0.4)))
        })
        return y + (lines.length * (fontSize * 0.4)) + 5
      }

      setProgress(20)

      // ✅ Page 1: Cover Page
      pdf.setFillColor(249, 115, 22) // Orange color
      pdf.rect(0, 0, pageWidth, 80, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.text('LocationIQ Insights Report', margin, 35)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 50)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      yPosition = 100
      pdf.text('Entity Comparison Report', margin, yPosition)
      
      yPosition += 20
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      
      // Entity details
      if (entityA && entityB) {
        pdf.setFillColor(249, 250, 251)
        pdf.rect(margin, yPosition, contentWidth, 40, 'F')
        
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Entity A:', margin + 5, yPosition + 15)
        pdf.setFont('helvetica', 'normal')
        pdf.text(entityA.name || 'Unknown', margin + 25, yPosition + 15)
        
        pdf.setFont('helvetica', 'bold')
        pdf.text('Entity B:', margin + 5, yPosition + 30)
        pdf.setFont('helvetica', 'normal')
        pdf.text(entityB.name || 'Unknown', margin + 25, yPosition + 30)
        
        yPosition += 50
      }

      setProgress(30)

      // ✅ Comparison Overview Box
      if (comparison.comparison_summary) {
        yPosition = checkPageSpace(60, yPosition)
        
        pdf.setFillColor(254, 243, 199) // Light orange
        pdf.rect(margin, yPosition, contentWidth, 50, 'F')
        pdf.setDrawColor(249, 115, 22)
        pdf.setLineWidth(1)
        pdf.rect(margin, yPosition, contentWidth, 50)
        
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(194, 65, 12) // Dark orange
        pdf.text('Comparison Overview', margin + 5, yPosition + 15)
        
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        pdf.setFont('helvetica', 'normal')
        
        const summary = comparison.comparison_summary
        let summaryY = yPosition + 25
        
        pdf.text(`Report Generated: ${new Date().toISOString()}`, margin + 5, summaryY)
        summaryY += 5
        pdf.text(`Processing Time: ${summary.processing_time || 'N/A'}ms`, margin + 5, summaryY)
        summaryY += 5
        pdf.text(`Total Similarities Found: ${summary.tags_found || 0}`, margin + 5, summaryY)
        summaryY += 5
        pdf.text(`Comparison Quality: ${summary.comparison_quality || 'Unknown'}`, margin + 5, summaryY)
        
        yPosition += 60
      }

      setProgress(40)

      // ✅ Page 2: AI Summary
      pdf.addPage()
      yPosition = margin
      
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(249, 115, 22)
      pdf.text('AI-Powered Summary', margin, yPosition)
      yPosition += 15
      
      if (comparison.summary) {
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        yPosition = addWrappedText(comparison.summary, margin, yPosition, contentWidth, 10)
      }

      setProgress(50)

      // ✅ Capture and add charts
      const chartElements = document.querySelectorAll('.recharts-wrapper, .comparison-chart, [data-chart]')
      
      if (chartElements.length > 0) {
        pdf.addPage()
        yPosition = margin
        
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(249, 115, 22)
        pdf.text('Visual Analysis', margin, yPosition)
        yPosition += 20

        for (let i = 0; i < chartElements.length; i++) {
          const element = chartElements[i]
          
          try {
            // ✅ Capture chart as canvas
            const canvas = await html2canvas(element, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false,
              allowTaint: true,
              useCORS: true,
              width: element.offsetWidth,
              height: element.offsetHeight
            })

            const imgData = canvas.toDataURL('image/png')
            const imgWidth = contentWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            yPosition = checkPageSpace(imgHeight + 10, yPosition)
            
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 15

            setProgress(50 + (i + 1) * (30 / chartElements.length))
          } catch (error) {
            console.error('Error capturing chart:', error)
          }
        }
      }

      setProgress(80)

      // ✅ Page 3: Detailed Similarities Table
      if (comparison.results && comparison.results.length > 0) {
        pdf.addPage()
        yPosition = margin
        
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(249, 115, 22)
        pdf.text('Detailed Similarities', margin, yPosition)
        yPosition += 20

        // Table header
        pdf.setFillColor(249, 115, 22)
        pdf.rect(margin, yPosition, contentWidth, 10, 'F')
        
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        
        const colWidths = [15, 60, 40, 30, 25]
        let xPos = margin
        
        pdf.text('#', xPos + 2, yPosition + 7)
        xPos += colWidths[0]
        pdf.text('Similarity', xPos + 2, yPosition + 7)
        xPos += colWidths[1]
        pdf.text('Category', xPos + 2, yPosition + 7)
        xPos += colWidths[2]
        pdf.text('Match Score', xPos + 2, yPosition + 7)
        xPos += colWidths[3]
        pdf.text('Popularity', xPos + 2, yPosition + 7)
        
        yPosition += 12

        // Table rows
        comparison.results.slice(0, 25).forEach((item, index) => {
          yPosition = checkPageSpace(8, yPosition)
          
          // Alternate row colors
          if (index % 2 === 0) {
            pdf.setFillColor(248, 250, 252)
            pdf.rect(margin, yPosition - 2, contentWidth, 8, 'F')
          }
          
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          
          xPos = margin
          pdf.text(`${index + 1}`, xPos + 2, yPosition + 5)
          xPos += colWidths[0]
          
          const name = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name
          pdf.text(name, xPos + 2, yPosition + 5)
          xPos += colWidths[1]
          
          const category = (item.subtype?.split(':')[2] || 'other').replace('_', ' ')
          pdf.text(category, xPos + 2, yPosition + 5)
          xPos += colWidths[2]
          
          pdf.text(`${((item.score || 0) * 100).toFixed(1)}%`, xPos + 2, yPosition + 5)
          xPos += colWidths[3]
          
          pdf.text(`${((item.popularity || 0) * 100).toFixed(1)}%`, xPos + 2, yPosition + 5)
          
          yPosition += 8
        })
      }

      setProgress(90)

      // ✅ Statistical Overview
      if (comparison.comparison_summary) {
        yPosition = checkPageSpace(80, yPosition)
        yPosition += 20
        
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(249, 115, 22)
        pdf.text('Statistical Overview', margin, yPosition)
        yPosition += 15
        
        const stats = [
          { label: 'Total Similarities', value: comparison.comparison_summary.tags_found || 0 },
          { label: 'High Score Matches', value: comparison.comparison_summary.high_score_count || 0 },
          { label: 'Average Score', value: `${((comparison.comparison_summary.average_score || 0) * 100).toFixed(1)}%` },
          { label: 'Categories Found', value: comparison.comparison_summary.categories || 0 },
          { label: 'Quality Rating', value: comparison.comparison_summary.comparison_quality || 'Unknown' }
        ]

        // Create a stats grid
        const statsPerRow = 2
        const statBoxWidth = contentWidth / statsPerRow - 5
        
        stats.forEach((stat, index) => {
          const row = Math.floor(index / statsPerRow)
          const col = index % statsPerRow
          const x = margin + (col * (statBoxWidth + 5))
          const y = yPosition + (row * 25)
          
          // Stat box
          pdf.setFillColor(254, 243, 199)
          pdf.rect(x, y, statBoxWidth, 20, 'F')
          pdf.setDrawColor(249, 115, 22)
          pdf.rect(x, y, statBoxWidth, 20)
          
          // Stat content
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(194, 65, 12)
          pdf.text(String(stat.value), x + 5, y + 8)
          
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(0, 0, 0)
          pdf.text(stat.label, x + 5, y + 16)
        })
      }

      setProgress(95)

      // ✅ **NEW**: Save to backend if requested
      if (saveToBackend) {
        try {
          // Convert PDF to base64 for backend transmission
          const pdfBase64 = pdf.output('datauristring').split(',')[1]
          
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const response = await fetch(`${baseURL}/generate-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comparisonData: comparison,
              summary: comparison.summary || null,
              pdfData: pdfBase64,
              entityA: entityA,
              entityB: entityB,
              metadata: {
                title: `Comparison Report - ${entityA?.name || 'Entity A'} vs ${entityB?.name || 'Entity B'}`,
                description: `AI-powered comparison analysis generated on ${new Date().toLocaleString()}`,
                entities: {
                  entityA: entityA?.name || 'Unknown',
                  entityB: entityB?.name || 'Unknown'
                },
                totalSimilarities: comparison.comparison_summary?.tags_found || 0,
                generatedAt: new Date().toISOString(),
                reportType: 'entity_comparison'
              }
            }),
          })

          const result = await response.json()
          
          if (result.success) {
            toast.success('PDF report saved successfully! Check Files page.', { id: toastId })
          } else {
            throw new Error(result.error || 'Failed to save PDF to backend')
          }
        } catch (error) {
          console.error('Backend save error:', error)
          toast.error(`Failed to save PDF: ${error.message}`, { id: toastId })
          
          // Still offer download even if backend save fails
          const fileName = `comparison_${Date.now()}.pdf`
          pdf.save(fileName)
        }
      } else {
        // ✅ Direct download
        const fileName = `comparison_${Date.now()}.pdf`
        pdf.save(fileName)
        toast.success('PDF downloaded successfully!', { id: toastId })
      }

      setProgress(100)
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0)
        setGenerating(false)
        setSaving(false)
      }, 1000)

    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error(`PDF generation failed: ${error.message}`, { id: toastId })
      setGenerating(false)
      setSaving(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* ✅ Download Button */}
      <button
        onClick={() => generateEnhancedPDF(false)}
        disabled={generating}
        className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating && !saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating... {progress}%</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Download Report</span>
            <FileText className="w-4 h-4" />
          </>
        )}
      </button>

      {/* ✅ **NEW**: Save to Backend Button */}
      <button
        onClick={() => generateEnhancedPDF(true)}
        disabled={generating}
        className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving... {progress}%</span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Save Report</span>
            <Save className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}

export default PDFDownloadButton
