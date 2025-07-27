'use client';

import React from 'react';
import { ProcessedDayData, Timeframe, DateRange } from '@/types';
import { FileText, Image, FileSpreadsheet, Database, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface ExportPanelProps {
  data: ProcessedDayData[];
  symbol: string;
  timeframe: Timeframe;
  selectedRange?: DateRange | null;
  onClose: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  data,
  symbol,
  timeframe,
  selectedRange,
  onClose
}) => {
  const getExportData = () => {
    if (selectedRange) {
      return data.filter(item => 
        item.date >= selectedRange.start && item.date <= selectedRange.end
      );
    }
    return data;
  };

  const exportData = getExportData();

  const exportAsCSV = () => {
    const headers = [
      'Date',
      'Open',
      'High', 
      'Low',
      'Close',
      'Volume',
      'Volatility',
      'Performance'
    ];

    const csvContent = [
      headers.join(','),
      ...exportData.map(item => [
        item.date.toISOString().split('T')[0],
        item.open,
        item.high,
        item.low,
        item.close,
        item.volume,
        item.volatility,
        item.performance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${symbol}_${timeframe.value}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJSON = () => {
    const jsonData = {
      symbol,
      timeframe: timeframe.value,
      exportDate: new Date().toISOString(),
      data: exportData
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${symbol}_${timeframe.value}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = async () => {
    try {
      const element = document.getElementById('analytics-dashboard');
      if (!element) {
        alert('Analytics dashboard not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${symbol}_${timeframe.value}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const exportAsImage = async () => {
    try {
      const element = document.getElementById('analytics-dashboard');
      if (!element) {
        alert('Analytics dashboard not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${symbol}_${timeframe.value}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV Export */}
        <button
          onClick={exportAsCSV}
          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Export as CSV</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download data in CSV format</p>
          </div>
        </button>

        {/* JSON Export */}
        <button
          onClick={exportAsJSON}
          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Database className="h-8 w-8 text-blue-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Export as JSON</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download data in JSON format</p>
          </div>
        </button>

        {/* PDF Export */}
        <button
          onClick={exportAsPDF}
          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FileText className="h-8 w-8 text-red-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Export as PDF</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generate PDF report</p>
          </div>
        </button>

        {/* Image Export */}
        <button
          onClick={exportAsImage}
          className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Image className="h-8 w-8 text-purple-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">Export as Image</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Save as PNG image</p>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Export Details</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><span className="font-medium">Symbol:</span> {symbol}</p>
          <p><span className="font-medium">Timeframe:</span> {timeframe.label}</p>
          <p><span className="font-medium">Data Points:</span> {exportData.length}</p>
          {selectedRange && (
            <p><span className="font-medium">Date Range:</span> {format(selectedRange.start, 'MMM dd, yyyy')} - {format(selectedRange.end, 'MMM dd, yyyy')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
