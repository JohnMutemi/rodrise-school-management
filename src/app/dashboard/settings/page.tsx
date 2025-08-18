'use client';

import { useState } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Users, 
  Palette,
  Database,
  Mail,
  Globe,
  Save,
  Eye,
  EyeOff,
  Upload,
  Download
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    paymentReminders: true,
    overdueAlerts: true,
    monthlyReports: true
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    showAnimations: true
  });

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your school's configuration and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500 text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Active Users</p>
                <p className="text-lg font-bold text-blue-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500 text-white">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-green-700">Last Backup</p>
                <p className="text-lg font-bold text-green-900">2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Security Score</p>
                <p className="text-lg font-bold text-purple-900">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500 text-white">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-orange-700">System Status</p>
                <p className="text-lg font-bold text-orange-900">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Database className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input id="schoolName" defaultValue="Rodrise Education" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="schoolAddress">Address</Label>
                  <Input id="schoolAddress" defaultValue="123 Education Street, Lagos" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input id="schoolPhone" defaultValue="+234 801 234 5678" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input id="schoolEmail" defaultValue="info@rodrise.edu.ng" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="schoolWebsite">Website</Label>
                  <Input id="schoolWebsite" defaultValue="www.rodrise.edu.ng" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Academic Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Academic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="academicYear">Current Academic Year</Label>
                  <Input id="academicYear" defaultValue="2024/2025" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="term">Current Term</Label>
                  <Input id="term" defaultValue="First Term" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="Nigerian Naira (₦)" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="Africa/Lagos" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input id="dateFormat" defaultValue="DD/MM/YYYY" className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotif">Email Notifications</Label>
                                             <Switch 
                         id="emailNotif" 
                         checked={notifications.email}
                         onCheckedChange={(checked: boolean) => setNotifications({...notifications, email: checked})}
                       />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="paymentReminders">Payment Reminders</Label>
                                             <Switch 
                         id="paymentReminders" 
                         checked={notifications.paymentReminders}
                         onCheckedChange={(checked: boolean) => setNotifications({...notifications, paymentReminders: checked})}
                       />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="overdueAlerts">Overdue Alerts</Label>
                                             <Switch 
                         id="overdueAlerts" 
                         checked={notifications.overdueAlerts}
                         onCheckedChange={(checked: boolean) => setNotifications({...notifications, overdueAlerts: checked})}
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Other Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotif">SMS Notifications</Label>
                      <Switch 
                        id="smsNotif" 
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushNotif">Push Notifications</Label>
                      <Switch 
                        id="pushNotif" 
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="monthlyReports">Monthly Reports</Label>
                      <Switch 
                        id="monthlyReports" 
                        checked={notifications.monthlyReports}
                        onCheckedChange={(checked) => setNotifications({...notifications, monthlyReports: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch 
                    id="twoFactor" 
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number" 
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input 
                    id="passwordExpiry" 
                    type="number" 
                    value={security.passwordExpiry}
                    onChange={(e) => setSecurity({...security, passwordExpiry: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input 
                    id="loginAttempts" 
                    type="number" 
                    value={security.loginAttempts}
                    onChange={(e) => setSecurity({...security, loginAttempts: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="mt-1" />
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Theme</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="light" name="theme" value="light" defaultChecked />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="dark" name="theme" value="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="auto" name="theme" value="auto" />
                      <Label htmlFor="auto">Auto</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Layout</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compactMode">Compact Mode</Label>
                      <Switch 
                        id="compactMode" 
                        checked={appearance.compactMode}
                        onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showAnimations">Show Animations</Label>
                      <Switch 
                        id="showAnimations" 
                        checked={appearance.showAnimations}
                        onCheckedChange={(checked) => setAppearance({...appearance, showAnimations: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Preview</h3>
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Automatic Backup</Label>
                    <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
                  </div>
                  <Switch id="autoBackup" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                  <Input id="backupRetention" type="number" defaultValue="30" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="backupLocation">Backup Location</Label>
                  <Input id="backupLocation" defaultValue="/backups" className="mt-1" />
                </div>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Create Manual Backup
                </Button>
              </CardContent>
            </Card>

            {/* Recent Backups */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Recent Backups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15 02:00', size: '2.3 GB', status: 'Completed' },
                    { date: '2024-01-14 02:00', size: '2.2 GB', status: 'Completed' },
                    { date: '2024-01-13 02:00', size: '2.1 GB', status: 'Completed' },
                    { date: '2024-01-12 02:00', size: '2.0 GB', status: 'Failed' }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{backup.date}</p>
                        <p className="text-sm text-gray-500">{backup.size}</p>
                      </div>
                      <Badge variant={backup.status === 'Completed' ? 'default' : 'destructive'}>
                        {backup.status}
                      </Badge>
                    </div>
                  ))}
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




