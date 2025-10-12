import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, TrendingUp, DollarSign, Plus, Target, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Expense } from "@shared/schema";

interface BudgetTrackerProps {
  tripId: string;
  totalBudget?: number;
}

export default function BudgetTracker({ tripId, totalBudget = 25000 }: BudgetTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses", tripId],
  });

  const categories = [
    { id: "all", name: "All", color: "bg-gray-500" },
    { id: "accommodation", name: "Hotels", color: "bg-blue-500" },
    { id: "transport", name: "Transport", color: "bg-green-500" },
    { id: "food", name: "Food", color: "bg-orange-500" },
    { id: "activities", name: "Activities", color: "bg-purple-500" },
    { id: "shopping", name: "Shopping", color: "bg-pink-500" },
    { id: "other", name: "Other", color: "bg-gray-500" }
  ];

  // Calculate totals
  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  // Category breakdown
  const categoryTotals = categories.map(category => {
    const categoryExpenses = category.id === 'all' 
      ? expenses 
      : expenses.filter(e => e.category === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return { ...category, total, count: categoryExpenses.length };
  });

  const filteredExpenses = selectedCategory === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === selectedCategory);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Budget Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-primary" />
              Budget Overview
            </div>
            <Button size="sm" className="travel-button">
              <Plus className="w-4 h-4 mr-1" />
              Add Expense
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Budget Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Budget Progress</span>
                <span className="text-sm text-gray-600">
                  {spentPercentage.toFixed(1)}% used
                </span>
              </div>
              <Progress 
                value={spentPercentage} 
                className="h-3"
                // @ts-ignore
                indicatorClassName={spentPercentage > 90 ? "bg-red-500" : spentPercentage > 70 ? "bg-orange-500" : "bg-primary"}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹{totalBudget.toLocaleString()}</span>
              </div>
            </div>

            {/* Budget Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalBudget.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Total Budget</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Spent</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${remaining >= 0 ? 'bg-orange-50' : 'bg-red-50'}`}>
                <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  ₹{Math.abs(remaining).toLocaleString()}
                </div>
                <div className={`text-sm ${remaining >= 0 ? 'text-orange-700' : 'text-red-700'}`}>
                  {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                </div>
              </div>
            </div>

            {/* Budget Alert */}
            {spentPercentage > 80 && (
              <div className={`flex items-center p-3 rounded-lg ${spentPercentage > 90 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  {spentPercentage > 90 
                    ? "Budget Alert: You're close to exceeding your budget!" 
                    : "Budget Warning: You've used 80% of your budget."}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categoryTotals.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Category Stats */}
            <div className="space-y-3">
              {categoryTotals.filter(cat => cat.id !== 'all' && cat.total > 0).map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.count} items
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{category.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((category.total / totalSpent) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Recent Expenses
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="ml-2">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded yet</p>
              <p className="text-sm">Add your first expense to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      categories.find(c => c.id === expense.category)?.color || 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      <div className="text-sm text-gray-500">
                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'} • {expense.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{parseFloat(expense.amount).toLocaleString()}</div>
                    {expense.notes && (
                      <div className="text-xs text-gray-500 max-w-32 truncate">
                        {expense.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredExpenses.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Expenses
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}