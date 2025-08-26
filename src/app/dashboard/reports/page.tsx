'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme, themes } from "@/contexts/ThemeContext";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Activity,
  Loader2
} from 'lucide-react';

interface ReportData {
  financial?: {
    totalRevenue: number;
    outstandingBalances: number;
    paymentRate: number;
    activeStudents: number;
    revenueChange: number;
    balanceChange: number;
    paymentRateChange: number;
    studentsChange: number;
  };
  overdue?: {
    categories: Array<{
      category: string;
      count: number;
      amount: number;
    }>;
  };
  students?: {
    demographics: Array<{
      class: string;
      students: number;
      percentage: number;
    }>;
  };
  feeTypes?: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData>({});
  
  // Always call useTheme hook, but handle the case where it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Theme context not available in reports page');
  }
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  // Fetch report data
  const fetchReportData = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports?type=${type}&period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} report data`);
      }
      
      const data = await response.json();
      
      setReportData(prev => ({
        ...prev,
        [type]: data
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all report data on component mount
  useEffect(() => {
    const fetchAllReports = async () => {
      await Promise.all([
        fetchReportData('financial'),
        fetchReportData('overdue'),
        fetchReportData('students'),
        fetchReportData('feeTypes')
      ]);
    };
    
    fetchAllReports();
  }, [selectedPeriod]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (!reportData[value as keyof ReportData]) {
      fetchReportData(value);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Financial stats derived from report data
  const financialStats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(reportData.financial?.totalRevenue || 0),
      change: formatPercentage(reportData.financial?.revenueChange || 0),
      changeType: (reportData.financial?.revenueChange || 0) >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Outstanding Balances',
      value: formatCurrency(reportData.financial?.outstandingBalances || 0),
      change: formatPercentage(reportData.financial?.balanceChange || 0),
      changeType: (reportData.financial?.balanceChange || 0) <= 0 ? 'positive' : 'negative',
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: 'Payment Rate',
      value: formatPercentage(reportData.financial?.paymentRate || 0),
      change: formatPercentage(reportData.financial?.paymentRateChange || 0),
      changeType: (reportData.financial?.paymentRateChange || 0) >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Active Students',
      value: (reportData.financial?.activeStudents || 0).toLocaleString(),
      change: formatPercentage(reportData.financial?.studentsChange || 0),
      changeType: (reportData.financial?.studentsChange || 0) >= 0 ? 'positive' : 'negative',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  // Overdue categories with color mapping
  const getOverdueColor = (category: string) => {
    if (category.includes('<30')) return 'bg-yellow-100 text-yellow-800';
    if (category.includes('30-60')) return 'bg-orange-100 text-orange-800';
    if (category.includes('60-90')) return 'bg-red-100 text-red-800';
    return 'bg-red-200 text-red-900';
  };

  const overdueCategories = reportData.overdue?.categories?.map(cat => ({
    ...cat,
    amount: formatCurrency(cat.amount),
    color: getOverdueColor(cat.category)
  })) || [];

  // Top fee types
  const topFeeTypes = reportData.feeTypes || [];

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-300 mt-1">Comprehensive financial and student insights</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
                <p className="text-white">Loading reports...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <Badge 
                            variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {stat.change}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-2">vs last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace('-600', '-500')} to-${stat.color.replace('text-', '').replace('-600', '-400')} bg-opacity-10`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Main Content Tabs */}
          {!loading && !error && (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="overdue" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Overdue
                </TabsTrigger>
                <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Revenue Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-gray-600">Revenue chart will be displayed here</p>
                          <p className="text-sm text-gray-500 mt-2">Total: {formatCurrency(reportData.financial?.totalRevenue || 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fee Types Breakdown */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Fee Types Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topFeeTypes.length > 0 ? (
                          topFeeTypes.map((fee, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                                <span className="text-sm font-medium text-gray-700">{fee.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(fee.amount)}</p>
                                <p className="text-xs text-gray-500">{fee.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <PieChart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No fee type data available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="overdue" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Overdue Balances by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overdueCategories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {overdueCategories.map((category, index) => (
                          <div key={index} className="p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={category.color}>
                                {category.category}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                            <p className="text-sm text-gray-600">students</p>
                            <p className="text-lg font-semibold text-gray-800 mt-1">{category.amount}</p>
                            <p className="text-xs text-gray-500">total outstanding</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No overdue balances found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Student Demographics */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Student Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="w-12 h-12 text-green-400 mx-auto mb-3" />
                          <p className="text-gray-600">Student demographics chart will be displayed here</p>
                          <p className="text-sm text-gray-500 mt-2">Total Students: {reportData.financial?.activeStudents || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Class-wise Distribution */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Class-wise Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reportData.students?.demographics && reportData.students.demographics.length > 0 ? (
                          reportData.students.demographics.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                              <span className="font-medium text-gray-700">{item.class}</span>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{item.students}</p>
                                <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No class distribution data available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Advanced Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Advanced analytics dashboard will be displayed here</p>
                        <p className="text-gray-500 text-sm mt-2">Including trends, predictions, and insights</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">Payment Rate</p>
                            <p className="text-blue-600">{formatPercentage(reportData.financial?.paymentRate || 0)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Outstanding</p>
                            <p className="text-orange-600">{formatCurrency(reportData.financial?.outstandingBalances || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

