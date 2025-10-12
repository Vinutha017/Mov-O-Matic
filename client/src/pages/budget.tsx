import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, DollarSign, TrendingUp, PieChart, Receipt, Plus } from 'lucide-react';

export default function Budget() {
  const budgetData = [
    { category: 'Accommodation', budgeted: 800, spent: 650, color: 'bg-blue-500' },
    { category: 'Transportation', budgeted: 400, spent: 350, color: 'bg-green-500' },
    { category: 'Food & Dining', budgeted: 300, spent: 280, color: 'bg-yellow-500' },
    { category: 'Activities', budgeted: 250, spent: 180, color: 'bg-purple-500' },
    { category: 'Shopping', budgeted: 200, spent: 120, color: 'bg-pink-500' },
  ];

  const totalBudget = budgetData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
              <p className="text-gray-600">Monitor your travel expenses</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Budget Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">${totalBudget}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">${totalSpent}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">${totalBudget - totalSpent}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Budget Breakdown</span>
            </CardTitle>
            <CardDescription>Track your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-600">
                      ${item.spent} / ${item.budgeted}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: `${Math.min((item.spent / item.budgeted) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{((item.spent / item.budgeted) * 100).toFixed(0)}% used</span>
                    <span>${item.budgeted - item.spent} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}