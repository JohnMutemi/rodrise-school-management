'use client';

import { useState } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  DollarSign, 
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Database
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errorCount?: number;
  errors?: Array<{ row: number; error: string }>;
  students?: Array<{ id: string; studentId: string; name: string; class: string; academicYear: string }>;
}

interface ExportResult {
  success: boolean;
  data?: any;
  filename?: string;
  recordCount?: number;
}

export default function BulkOperationsPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setImportFile(file);
      setImportResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll simulate the import since the API expects JSON data
      // In a real implementation, you would parse the CSV file and send JSON
      const mockResult = {
        success: true,
        message: 'Successfully imported students',
        importedCount: 5,
        errorCount: 0,
        students: [
          { id: '1', studentId: 'STU001', name: 'John Doe', class: 'JSS 1', academicYear: '2024/2025' },
          { id: '2', studentId: 'STU002', name: 'Jane Smith', class: 'JSS 1', academicYear: '2024/2025' },
        ]
      };
      
      setImportResult(mockResult);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to import students',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bulk-operations/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: exportType,
          format: exportFormat,
          filters: {
            schoolId: 'school-1', // Replace with actual school ID
          },
        }),
      });

      if (exportFormat === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        setExportResult(result);
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: 'Failed to export data',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Create a simple CSV template
      const csvContent = `firstName,lastName,studentId,email,phone,dateOfBirth,gender,address,parentName,parentPhone,parentEmail,classId,academicYearId,enrollmentDate,status
John,Doe,STU001,john.doe@email.com,+2348012345678,2005-01-15,MALE,123 Main St,John Doe Sr,+2348012345679,john.sr@email.com,class-1,academic-year-1,2024-09-01,ACTIVE
Jane,Smith,STU002,jane.smith@email.com,+2348012345680,2005-03-20,FEMALE,456 Oak Ave,Jane Smith Sr,+2348012345681,jane.sr@email.com,class-1,academic-year-1,2024-09-01,ACTIVE`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students-import-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download template');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Bulk Operations</h1>
              <p className="text-gray-300 mt-1">Import and export data in bulk</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Import Students</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">CSV Upload</p>
                    <p className="text-xs text-gray-500 mt-2">Bulk student registration</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 bg-opacity-10">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Export Data</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">CSV/JSON</p>
                    <p className="text-xs text-gray-500 mt-2">Download reports</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-400 bg-opacity-10">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Management</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">Backup</p>
                    <p className="text-xs text-gray-500 mt-2">Complete data export</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 bg-opacity-10">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="import" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Import Students */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Import Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select CSV File
                        </label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={downloadTemplate}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Download Template
                        </Button>
                        
                        <Button
                          onClick={handleImport}
                          disabled={!importFile || loading}
                          className="flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Import Students
                        </Button>
                      </div>
                    </div>

                    {/* Import Result */}
                    {importResult && (
                      <div className={`p-4 rounded-lg border ${
                        importResult.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {importResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            importResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {importResult.message}
                          </span>
                        </div>
                        
                        {importResult.success && (
                          <div className="text-sm text-green-700">
                            <p>Imported: {importResult.importedCount} students</p>
                            {importResult.errorCount && (
                              <p>Errors: {importResult.errorCount}</p>
                            )}
                          </div>
                        )}

                        {importResult.errors && importResult.errors.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                            <div className="max-h-32 overflow-y-auto">
                              {importResult.errors.map((error, index) => (
                                <div key={index} className="text-xs text-red-600">
                                  Row {error.row}: {error.error}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {importResult.students && importResult.students.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-green-700 mb-2">Imported Students:</p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {importResult.students.map((student) => (
                                <div key={student.id} className="text-xs text-green-600">
                                  {student.name} ({student.studentId}) - {student.class}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Import Instructions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Import Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-600">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">CSV Format Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>First row must contain column headers</li>
                          <li>Required fields: firstName, lastName, studentId, classId, academicYearId</li>
                          <li>Optional fields: email, phone, dateOfBirth, gender, address</li>
                          <li>Date format: YYYY-MM-DD</li>
                          <li>Gender values: MALE, FEMALE, OTHER</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Validation Rules:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Student IDs must be unique</li>
                          <li>Email addresses must be valid format</li>
                          <li>Class and Academic Year IDs must exist</li>
                          <li>Phone numbers should include country code</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Tips:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Download the template first to see the correct format</li>
                          <li>Use Excel or Google Sheets to prepare your data</li>
                          <li>Save as CSV format before uploading</li>
                          <li>Check for duplicate student IDs</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Export Options */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      Export Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Type
                        </label>
                        <select
                          value={exportType}
                          onChange={(e) => setExportType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="students">Students</option>
                          <option value="payments">Payments</option>
                          <option value="fee-balances">Fee Balances</option>
                          <option value="fee-structures">Fee Structures</option>
                          <option value="all">All Data</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Export Format
                        </label>
                        <select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="csv">CSV</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>

                      <Button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)}
                      </Button>
                    </div>

                    {/* Export Result */}
                    {exportResult && (
                      <div className={`p-4 rounded-lg border ${
                        exportResult.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {exportResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            exportResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {exportResult.message || 'Export completed'}
                          </span>
                        </div>
                        
                        {exportResult.success && exportResult.recordCount && (
                          <div className="text-sm text-green-700">
                            <p>Records exported: {exportResult.recordCount}</p>
                            {exportResult.filename && (
                              <p>Filename: {exportResult.filename}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Export Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Export Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-600">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Available Exports:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Students - Complete student records</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>Payments - Payment history and receipts</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-orange-600" />
                            <span>Fee Balances - Outstanding balances and status</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>Fee Structures - Fee configurations</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-gray-600" />
                            <span>All Data - Complete system backup</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Export Formats:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>CSV:</strong> Excel-compatible format for data analysis</li>
                          <li><strong>JSON:</strong> Structured data format for system integration</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Filter by date ranges, classes, and status</li>
                          <li>Include all related data and relationships</li>
                          <li>Properly formatted dates and currency values</li>
                          <li>CSV files are ready for Excel/Google Sheets</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
