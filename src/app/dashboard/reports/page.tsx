'use client';

import { useState } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Activity
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialStats = [
    {
      title: 'Total Revenue',
      value: '₦2,450,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Outstanding Balances',
      value: '₦890,000',
      change: '-8.2%',
      changeType: 'negative',
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: 'Payment Rate',
      value: '87.3%',
      change: '+5.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Active Students',
      value: '1,247',
      change: '+2.8%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  const overdueCategories = [
    { category: '&lt;30 days', count: 45, amount: '₦125,000', color: 'bg-yellow-100 text-yellow-800' },
    { category: '30-60 days', count: 23, amount: '₦89,000', color: 'bg-orange-100 text-orange-800' },
    { category: '60-90 days', count: 12, amount: '₦67,000', color: 'bg-red-100 text-red-800' },
    { category: '&gt;90 days', count: 8, amount: '₦45,000', color: 'bg-red-200 text-red-900' }
  ];

  const topFeeTypes = [
    { name: 'Tuition Fees', amount: '₦1,200,000', percentage: 48.9 },
    { name: 'Library Fees', amount: '₦450,000', percentage: 18.4 },
    { name: 'Laboratory Fees', amount: '₦380,000', percentage: 15.5 },
    { name: 'Sports Fees', amount: '₦220,000', percentage: 9.0 },
    { name: 'Other Charges', amount: '₦200,000', percentage: 8.2 }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial and student insights</p>
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

      {/* Stats Cards */}
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="financial" className="space-y-6">
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
                  {topFeeTypes.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <span className="text-sm font-medium text-gray-700">{fee.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{fee.amount}</p>
                        <p className="text-xs text-gray-500">{fee.percentage}%</p>
                      </div>
                    </div>
                  ))}
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
                  {[
                    { class: 'JSS 1', students: 156, percentage: 12.5 },
                    { class: 'JSS 2', students: 148, percentage: 11.9 },
                    { class: 'JSS 3', students: 142, percentage: 11.4 },
                    { class: 'SSS 1', students: 138, percentage: 11.1 },
                    { class: 'SSS 2', students: 135, percentage: 10.8 },
                    { class: 'SSS 3', students: 128, percentage: 10.3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                      <span className="font-medium text-gray-700">{item.class}</span>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.students}</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

