import React, { useState, useEffect, useContext } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AuthContext } from "../../Context/AuthContext";
import "./Budget.css";
import toast from "react-hot-toast";

const API_BASE = "https://real-time-chat-server-rosy.vercel.app";

const Budget = () => {
  const { user } = useContext(AuthContext);
  const userEmail = user?.email;

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceWarning, setBalanceWarning] = useState("");

  // ✅ Categories
  const incomeCategories = [
    { value: "salary", label: "Salary", icon: "💼" },
    { value: "scholarship", label: "Scholarship", icon: "🎓" },
    { value: "part-time", label: "Part-time Job", icon: "⏱️" },
    { value: "allowance", label: "Allowance", icon: "👨‍👩‍👧‍👦" },
    { value: "freelancing", label: "Freelancing", icon: "💻" },
    { value: "investment", label: "Investment", icon: "📈" },
    { value: "gift", label: "Gift", icon: "🎁" },
    { value: "other-income", label: "Other Income", icon: "💰" },
  ];

  const expenseCategories = [
    { value: "food", label: "Food", icon: "🍔" },
    { value: "transport", label: "Transport", icon: "🚌" },
    { value: "books", label: "Books", icon: "📚" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "clothes", label: "Clothes", icon: "👕" },
    { value: "health", label: "Health", icon: "🏥" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "rent", label: "Rent", icon: "🏠" },
    { value: "supplies", label: "Supplies", icon: "🛒" },
    { value: "other-expense", label: "Other Expense", icon: "💸" },
  ];

  // ✅ Fetch transactions (email based)
  const fetchTransactions = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/budgets?email=${userEmail}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      toast.error("Failed to fetch transactions ❌");
      setError(err.message);
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add
  const addTransaction = async (transaction) => {
    try {
      // 🔹 Check if adding an expense would exceed available income
      if (transaction.type === "expense") {
        const expenseAmount = parseFloat(transaction.amount);
        const currentBalance = calculateCurrentBalance();
  
        if (expenseAmount > currentBalance) {
          setBalanceWarning(
            `Warning: This expense (${formatCurrency(expenseAmount)}) exceeds your available balance (${formatCurrency(currentBalance)})`
          );
          return false;
        }
      }
  
      const response = await fetch(`${API_BASE}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, email: userEmail }),
      });
  
      if (!response.ok) throw new Error("Failed to add transaction");
  
      setBalanceWarning(""); // Clear any previous warnings
      await fetchTransactions();
  
      // ✅ Dynamic toast based on transaction type
      if (transaction.type === "income") {
        toast.success("Income added successfully ✅");
      } else if (transaction.type === "expense") {
        toast.success("Expense added successfully ✅");
      } else {
        toast.success("Transaction added successfully ✅");
      }
  
      return true;
    } catch (err) {
      toast.error("Failed to add transaction ❌");
      setError(err.message);
      return false;
    }
  };

  // ✅ Update
  const updateTransaction = async (id, transaction) => {
    try {
      // Check if updating to an expense would exceed available income
      if (transaction.type === "expense") {
        const originalTransaction = transactions.find(t => t._id === id);
        const originalAmount = originalTransaction ? parseFloat(originalTransaction.amount) : 0;
        const newAmount = parseFloat(transaction.amount);
        
        // Calculate the net change (if switching from income to expense, it's a double impact)
        let netChange = 0;
        if (originalTransaction.type === "income") {
          netChange = originalAmount + newAmount; // Losing income and adding expense
        } else {
          netChange = newAmount - originalAmount; // Just expense amount change
        }
        
        const currentBalance = calculateCurrentBalance();
        
        if (netChange > currentBalance) {
          setBalanceWarning(`Warning: This update would exceed your available balance (${formatCurrency(currentBalance)})`);
          return false;
        }
      }
      
      const response = await fetch(`${API_BASE}/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, email: userEmail }),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      
      setBalanceWarning(""); // Clear any previous warnings
      await fetchTransactions();
      toast.success("Transaction updated successfully ✅");
      return true;
    } catch (err) {
      toast.error("Failed to update transaction ❌");
      setError(err.message);

      return false;
    }
  };

 

  // ✅ Calculate current balance (income minus expenses)
  const calculateCurrentBalance = () => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return totalIncome - totalExpenses;
  };

  // ✅ Effects
  useEffect(() => {
    fetchTransactions();
  }, [userEmail]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredTransactions([...transactions].reverse());
    } else {
      setFilteredTransactions(
        transactions.filter((t) => t.type === filter).reverse()
      );
    }
  }, [transactions, filter]);

  // ✅ Metrics
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // ✅ Charts
  const expenseData = expenseCategories
    .map((category) => {
      const total = transactions
        .filter((t) => t.type === "expense" && t.category === category.value)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return { name: category.label, value: total, icon: category.icon };
    })
    .filter((item) => item.value > 0);

  const incomeData = incomeCategories
    .map((category) => {
      const total = transactions
        .filter((t) => t.type === "income" && t.category === category.value)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return { name: category.label, value: total, icon: category.icon };
    })
    .filter((item) => item.value > 0);

  const monthlyData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString("default", { month: "short" });
    const year = month.getFullYear();

    const monthIncome = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date).getMonth() === month.getMonth() &&
          new Date(t.date).getFullYear() === year
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthExpenses = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date).getMonth() === month.getMonth() &&
          new Date(t.date).getFullYear() === year
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    monthlyData.push({
      name: `${monthName} ${year}`,
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  // ✅ Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear balance warning when user changes input
    if (name === "amount" || name === "type") {
      setBalanceWarning("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please fill all fields with valid values");
      return;
    }
    if (formData.description.length > 100) {
      alert("Description must be 100 characters or less");
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount).toFixed(2),
    };

    let success = false;
    if (editingId) {
      success = await updateTransaction(editingId, transactionData);
    } else {
      success = await addTransaction(transactionData);
    }

    if (success) {
      setFormData({
        type: "expense",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
    });
    setEditingId(transaction._id);
    setShowForm(true);
    setBalanceWarning(""); // Clear any previous warnings when editing
  };
 // ✅ Delete
 const deleteTransaction = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete transaction");
    }

    await fetchTransactions(); // refresh the list
    return true;
  } catch (err) {
    toast.error("Failed to delete transaction ❌");
    setError(err.message);
    return false;
  }
};

const handleDelete = async (id) => {
  const success = await deleteTransaction(id);

  if (success) {
    toast.success("Transaction deleted ✅");
    setDeleteConfirm(null);
  } else {
    toast.error("Failed to delete ❌");
  }
};
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      amount
    );

  const getCategoryDetails = (type, value) =>
    type === "income"
      ? incomeCategories.find((c) => c.value === value) || { label: value, icon: "💰" }
      : expenseCategories.find((c) => c.value === value) || { label: value, icon: "💸" };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A4DE6C", "#D0ED57", "#8884D8", "#82CA9D"];

  if (loading) return <div className="loading">Loading budget data...</div>;

  return (
    <div className="budget-container">
      <h2>Budget Management</h2>
      <button 
        className="btn-primary mb-3"
        onClick={() => {
          setShowForm(true);
          setBalanceWarning(""); // Clear warnings when opening form
        }}
      >
        Add Transaction
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}. Please check your backend connection.
        </div>
      )}
      
      {/* Financial Overview Cards */}
      <div className="financial-overview">
        <div className="metric-card income">
          <h3>Total Income</h3>
          <div className="amount">{formatCurrency(totalIncome)}</div>
          <div className="trend">All money coming in</div>
        </div>
        
        <div className="metric-card expense">
          <h3>Total Expenses</h3>
          <div className="amount">{formatCurrency(totalExpenses)}</div>
          <div className="trend">All spending</div>
        </div>
        
        <div className="metric-card balance">
          <h3>Available Balance</h3>
          <div className={`amount ${netBalance < 0 ? 'negative' : ''}`}>
            {formatCurrency(netBalance)}
          </div>
          <div className="trend">Income minus expenses</div>
        </div>
        
        <div className="metric-card savings">
          <h3>Savings Rate</h3>
          <div className={`amount ${
            savingsRate >= 20 ? 'excellent' : 
            savingsRate >= 10 ? 'good' : 'poor'
          }`}>
            {savingsRate.toFixed(1)}%
          </div>
          <div className="trend">
            {savingsRate >= 20 ? 'Excellent!' : 
             savingsRate >= 10 ? 'Good' : 'Needs improvement'}
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No expense data available</div>
          )}
        </div>
        
        <div className="chart-container">
          <h3>Income Sources</h3>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={value => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No income data available</div>
          )}
        </div>
        
        <div className="chart-container full-width">
          <h3>Monthly Trends (Last 6 Months)</h3>
          {monthlyData.some(m => m.income > 0 || m.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={value => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ff8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No monthly data available</div>
          )}
        </div>
      </div>
      
      {/* Transaction Management */}
      <div className="transaction-section">
        <div className="section-header">
          <h3>Transactions</h3>
          <div className="controls">
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'income' ? 'active' : ''}
                onClick={() => setFilter('income')}
              >
                Income
              </button>
              <button 
                className={filter === 'expense' ? 'active' : ''}
                onClick={() => setFilter('expense')}
              >
                Expenses
              </button>
            </div>
          </div>
        </div>
        
        <div className="transaction-counter">
          Showing {filteredTransactions.length} transactions
        </div>
        
        {/* Transaction Form */}
        {showForm && (
          <div className="transaction-form-overlay">
            <div className="transaction-form">
              <h3>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              {balanceWarning && (
                <div className="balance-warning">
                  ⚠️ {balanceWarning}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleInputChange}
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      
                      
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {(formData.type === 'income' ? incomeCategories : expenseCategories)
                        .map(category => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description ({100 - formData.description.length} characters left)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength="100"
                    placeholder="Brief description of the transaction"
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        type: 'expense',
                        category: '',
                        amount: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0]
                      });
                      setBalanceWarning("");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={balanceWarning && formData.type === "expense"}
                  >
                    {editingId ? 'Update' : 'Add'} Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Transactions List */}
        <div className="transactions-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => {
              const categoryDetails = getCategoryDetails(transaction.type, transaction.category);
              return (
                <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-icon">
                    {categoryDetails.icon}
                  </div>
                  
                  <div className="transaction-details">
                    <div className="transaction-category">{categoryDetails.label}</div>
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="transaction-amount">
                    {formatCurrency(parseFloat(transaction.amount))}
                  </div>
                  
                  <div className="transaction-actions">
                    <button 
                      className="icon-btn"
                      onClick={() => handleEdit(transaction)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={() => setDeleteConfirm(transaction._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {deleteConfirm === transaction._id && (
                    <div className="delete-confirm">
                      <p>Are you sure you want to delete this transaction?</p>
                      <div>
                        <button 
                          className="btn-secondary"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleDelete(transaction._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              {filter === 'all' 
                ? 'No transactions yet. Add your first transaction to get started!' 
                : `No ${filter} transactions found.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;