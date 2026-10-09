import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Bus,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clapperboard,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import { API_BASE } from "../../api";
import "./BudgetDashboard.css";

const chartColors = ["#3478f6", "#08b889", "#ffbb33", "#ff6384", "#8759ed", "#39b9d3", "#ff8a4c", "#969eab"];
const categoryIcons = {
  food: Utensils,
  transport: Bus,
  books: BookOpen,
  entertainment: Clapperboard,
  clothes: ShoppingBag,
  health: HeartPulse,
  utilities: Lightbulb,
  rent: House,
  supplies: ShoppingBag,
  "other-expense": CircleDollarSign,
  salary: Wallet,
  scholarship: GraduationCap,
  "part-time": Coffee,
  allowance: Wallet,
  freelancing: ChartNoAxesCombined,
  investment: TrendingUp,
  gift: Sparkles,
  "other-income": CircleDollarSign,
};

const emptyForm = () => ({
  type: "expense",
  category: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
});
const toAmount = (transaction) => Number.parseFloat(transaction?.amount) || 0;
const parseTransactionDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === "string" && (dateStr.includes("T") || dateStr.includes(" "))) {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  const parsed = new Date(`${dateStr}T00:00:00`);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};
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
  { value: "food", label: "Food & Drinks", icon: "🍔" },
  { value: "transport", label: "Transportation", icon: "🚌" },
  { value: "books", label: "Study Materials", icon: "📚" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "clothes", label: "Clothes", icon: "👕" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "utilities", label: "Bills & Utilities", icon: "💡" },
  { value: "rent", label: "Rent", icon: "🏠" },
  { value: "supplies", label: "Supplies", icon: "🛒" },
  { value: "other-expense", label: "Other Expense", icon: "💸" },
];

const Budget = () => {
  const { user } = useContext(AuthContext);
  const userEmail = user?.email;
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceWarning, setBalanceWarning] = useState("");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const getCategoryDetails = useCallback((type, value) =>
    (type === "income" ? incomeCategories : expenseCategories)
      .find((category) => category.value === value) || { label: value || "Other", icon: "💰" }, []);

  const fetchTransactions = useCallback(async () => {
    if (!userEmail) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/budget`, { params: { email: userEmail } });
      const rawData = response.data;
      const data = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
      setTransactions(data);
      setError(null);
    } catch (fetchError) {
      toast.error("Failed to fetch transactions.");
      setError(fetchError.message);
      console.error("Error fetching transactions:", fetchError);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + toAmount(transaction), 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + toAmount(transaction), 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...transactions]
      .filter((transaction) => filter === "all" || transaction.type === filter)
      .filter((transaction) => {
        if (!query) return true;
        const category = getCategoryDetails(transaction.type, transaction.category).label;
        return [category, transaction.description, transaction.date, transaction.type]
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((first, second) => parseTransactionDate(second.date) - parseTransactionDate(first.date));
  }, [filter, getCategoryDetails, searchQuery, transactions]);

  const expenseData = expenseCategories
    .map((category) => ({
      name: category.label,
      value: transactions
        .filter((transaction) => transaction.type === "expense" && transaction.category === category.value)
        .reduce((sum, transaction) => sum + toAmount(transaction), 0),
      category: category.value,
    }))
    .filter((category) => category.value > 0)
    .sort((first, second) => second.value - first.value);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const rows = transactions.filter((transaction) => {
        const transactionDate = parseTransactionDate(transaction.date);
        return transactionDate.getFullYear() === month.getFullYear() &&
          transactionDate.getMonth() === month.getMonth();
      });
      return {
        name: month.toLocaleString("en", { month: "short" }),
        income: rows.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + toAmount(transaction), 0),
        expenses: rows.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + toAmount(transaction), 0),
      };
    });
  }, [transactions]);

  const highestCategory = expenseData[0];
  const thisMonth = new Date();
  const currentMonthExpenses = transactions
    .filter((transaction) => {
      const date = parseTransactionDate(transaction.date);
      return transaction.type === "expense" &&
        date.getFullYear() === thisMonth.getFullYear() &&
        date.getMonth() === thisMonth.getMonth();
    })
    .reduce((sum, transaction) => sum + toAmount(transaction), 0);
  const savingsProgress = Math.max(0, Math.min((savingsRate / 20) * 100, 100));

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingId(null);
    setBalanceWarning("");
  };

  const openForm = (type = "expense") => {
    resetForm();
    setFormData({ ...emptyForm(), type });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
    if (name === "amount" || name === "type") setBalanceWarning("");
  };

  const addTransaction = async (transaction) => {
    if (transaction.type === "expense" && toAmount(transaction) > netBalance) {
      setBalanceWarning(
        `This expense is greater than your available balance of ${formatCurrency(netBalance)}.`,
      );
      return false;
    }
    try {
      await axios.post(`${API_BASE}/budget`, { ...transaction, email: userEmail });
      await fetchTransactions();
      toast.success(transaction.type === "income" ? "Income added." : "Expense added.");
      return true;
    } catch (requestError) {
      toast.error("Failed to add transaction.");
      setError(requestError.message);
      console.error("Error adding transaction:", requestError);
      return false;
    }
  };

  const updateTransaction = async (id, transaction) => {
    const original = transactions.find((item) => item._id === id);
    const originalImpact = original?.type === "income" ? toAmount(original) : -toAmount(original || {});
    const newImpact = transaction.type === "income" ? toAmount(transaction) : -toAmount(transaction);
    const projectedBalance = netBalance - originalImpact + newImpact;
    if (transaction.type === "expense" && projectedBalance < 0) {
      setBalanceWarning(
        `This update would put your balance below zero. Available after update: ${formatCurrency(projectedBalance)}.`,
      );
      return false;
    }
    try {
      await axios.put(`${API_BASE}/budget/${id}`, { ...transaction, email: userEmail });
      await fetchTransactions();
      toast.success("Transaction updated.");
      return true;
    } catch (requestError) {
      toast.error("Failed to update transaction.");
      setError(requestError.message);
      console.error("Error updating transaction:", requestError);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.category || !formData.amount || Number(formData.amount) <= 0) {
      toast.error("Enter a category and a valid amount.");
      return;
    }
    const transaction = {
      ...formData,
      amount: Number(formData.amount).toFixed(2),
      description: formData.description.trim(),
    };
    const success = editingId
      ? await updateTransaction(editingId, transaction)
      : await addTransaction(transaction);
    if (success) {
      setShowForm(false);
      resetForm();
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || "",
      date: transaction.date,
    });
    setEditingId(transaction._id);
    setBalanceWarning("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/budget/${id}`, { params: { email: userEmail } });
      setTransactions((current) => current.filter((transaction) => transaction._id !== id));
      setDeleteConfirm(null);
      toast.success("Transaction deleted.");
    } catch (requestError) {
      toast.error("Failed to delete transaction.");
      setError(requestError.message);
      console.error("Error deleting transaction:", requestError);
    }
  };

  const chartTooltip = {
    contentStyle: { border: "1px solid #e8ebf1", borderRadius: 10, fontSize: 11 },
    formatter: (value) => formatCurrency(Number(value)),
  };

  if (loading) {
    return (
      <main className="budget-page">
        <div className="budget-loading"><span className="budget-spinner" />Loading your money dashboard…</div>
      </main>
    );
  }

  return (
    <main className="budget-page">
      <div className="budget-shell">
        <header className="budget-heading">
          <div>
            <span className="budget-kicker"><Wallet size={15} /> YOUR STUDENT FINANCES</span>
            <h1>Take control <span>of your money.</span></h1>
            <p>Track your income, understand your spending, and build better money habits.</p>
          </div>
          <div className="budget-heading-actions">
            <button className="budget-add-button budget-add-income" onClick={() => openForm("income")}>
              <Plus size={16} /> Add income
            </button>
            <button className="budget-add-button" onClick={() => openForm("expense")}>
              <Plus size={16} /> Add expense
            </button>
          </div>
        </header>

        {error && (
          <div className="budget-error" role="alert">
            <span>{error}</span>
            <button onClick={fetchTransactions}>Try again</button>
          </div>
        )}

        <section className="budget-metrics" aria-label="Financial overview">
          <article className="budget-metric budget-metric-balance">
            <span className="budget-metric-icon"><Wallet size={18} /></span>
            <span className="budget-metric-label">TOTAL BALANCE</span>
            <strong>{formatCurrency(netBalance)}</strong>
            <small><CircleDollarSign size={13} /> Income minus expenses</small>
          </article>
          <article className="budget-metric budget-metric-income">
            <span className="budget-metric-icon"><ArrowDownLeft size={18} /></span>
            <span className="budget-metric-label">TOTAL INCOME</span>
            <strong>{formatCurrency(totalIncome)}</strong>
            <small><TrendingUp size={13} /> {transactions.filter((transaction) => transaction.type === "income").length} deposits recorded</small>
          </article>
          <article className="budget-metric budget-metric-expense">
            <span className="budget-metric-icon"><ArrowUpRight size={18} /></span>
            <span className="budget-metric-label">TOTAL EXPENSES</span>
            <strong>{formatCurrency(totalExpenses)}</strong>
            <small><TrendingDown size={13} /> {transactions.filter((transaction) => transaction.type === "expense").length} purchases tracked</small>
          </article>
          <article className="budget-metric budget-metric-savings">
            <span className="budget-metric-icon"><ChartNoAxesCombined size={18} /></span>
            <span className="budget-metric-label">SAVINGS RATE</span>
            <strong>{savingsRate.toFixed(1)}%</strong>
            <div className="budget-progress-track"><span style={{ width: `${savingsProgress}%` }} /></div>
            <small>{savingsRate >= 20 ? "20% savings benchmark reached" : "Progress toward 20% benchmark"}</small>
          </article>
        </section>

        <section className="budget-analytics-grid">
          <article className="budget-panel budget-trend-panel">
            <div className="budget-panel-heading">
              <div><span className="budget-eyebrow">MONEY IN / MONEY OUT</span><h2>Monthly overview</h2></div>
              <span className="budget-period-label">Last 6 months</span>
            </div>
            {monthlyData.some((month) => month.income || month.expenses) ? (
              <div className="budget-chart budget-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 8, right: 5, bottom: 0, left: -17 }} barGap={5}>
                    <CartesianGrid vertical={false} stroke="#edf0f4" />
                    <XAxis dataKey="name" tick={{ fill: "#7c8491", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9299a5", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip {...chartTooltip} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 9 }} />
                    <Bar dataKey="income" name="Income" fill="#3478f6" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ec4d91" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="budget-chart-empty"><ChartNoAxesCombined size={28} /><span>Monthly trends will show here once you add transactions.</span></div>
            )}
          </article>

          <article className="budget-panel budget-breakdown-panel">
            <div className="budget-panel-heading">
              <div><span className="budget-eyebrow">WHERE IT GOES</span><h2>Expense breakdown</h2></div>
              <span className="budget-period-label">All time</span>
            </div>
            {expenseData.length ? (
              <div className="budget-breakdown-body">
                <div className="budget-donut-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseData} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="92%" paddingAngle={2} stroke="none">
                        {expenseData.map((entry, index) => (
                          <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="budget-donut-label"><strong>{formatCurrency(totalExpenses)}</strong><span>Total spent</span></div>
                </div>
                <div className="budget-legend">
                  {expenseData.slice(0, 5).map((entry, index) => (
                    <div className="budget-legend-row" key={entry.category}>
                      <i style={{ background: chartColors[index % chartColors.length] }} />
                      <span>{entry.name}</span>
                      <small>{totalExpenses ? `${Math.round((entry.value / totalExpenses) * 100)}%` : "0%"}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="budget-chart-empty"><CircleDollarSign size={28} /><span>Your expense mix will appear after your first purchase.</span></div>
            )}
          </article>

          <article className="budget-panel budget-insights-panel">
            <div className="budget-panel-heading">
              <div><span className="budget-eyebrow">A LITTLE CLARITY</span><h2>Spending insights</h2></div>
              <Sparkles size={18} />
            </div>
            <div className="budget-insights-list">
              <div className="budget-insight">
                <span className="budget-insight-icon is-pink"><ShoppingBag size={16} /></span>
                <p>{highestCategory
                  ? <><strong>{highestCategory.name}</strong> is your top spending category at <strong>{formatCurrency(highestCategory.value)}</strong>.</>
                  : "Your category insights will appear when you record an expense."}</p>
              </div>
              <div className="budget-insight">
                <span className="budget-insight-icon is-blue"><ChartNoAxesCombined size={16} /></span>
                <p>This month, you’ve tracked <strong>{formatCurrency(currentMonthExpenses)}</strong> in expenses.</p>
              </div>
              <div className="budget-insight">
                <span className="budget-insight-icon is-green"><TrendingUp size={16} /></span>
                <p>{savingsRate >= 20
                  ? <>Your <strong>{savingsRate.toFixed(1)}%</strong> savings rate meets the 20% benchmark. Great work!</>
                  : <>Your savings rate is <strong>{savingsRate.toFixed(1)}%</strong>. Small choices add up.</>}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="budget-lower-grid">
          <article className="budget-panel budget-categories-panel">
            <div className="budget-panel-heading">
              <div><span className="budget-eyebrow">KNOW YOUR HABITS</span><h2>Budget categories</h2></div>
            </div>
            {expenseData.length ? (
              <div className="budget-category-list">
                {expenseData.slice(0, 6).map((entry, index) => {
                  const category = expenseCategories.find((item) => item.value === entry.category);
                  const Icon = categoryIcons[entry.category] || ShoppingBag;
                  const percent = totalExpenses ? (entry.value / totalExpenses) * 100 : 0;
                  return (
                    <div className="budget-category-row" key={entry.category}>
                      <span className="budget-category-icon" style={{ "--category-color": chartColors[index % chartColors.length] }}>
                        <Icon size={15} />
                      </span>
                      <span className="budget-category-info">
                        <span><strong>{category?.label || entry.name}</strong><small>{formatCurrency(entry.value)}</small></span>
                        <i><b style={{ width: `${percent}%`, background: chartColors[index % chartColors.length] }} /></i>
                      </span>
                      <small className="budget-category-percent">{Math.round(percent)}%</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="budget-small-empty">Add expenses to see your category breakdown.</div>
            )}
          </article>

          <article className="budget-panel budget-transactions-panel">
            <div className="budget-panel-heading budget-transactions-heading">
              <div><span className="budget-eyebrow">THE LATEST</span><h2>Recent transactions</h2></div>
              <span className="budget-transaction-count">{filteredTransactions.length} shown</span>
            </div>
            <div className="budget-transaction-controls">
              <label className="budget-search">
                <Search size={15} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search transactions"
                  aria-label="Search transactions"
                />
                {searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Clear search"><X size={14} /></button>}
              </label>
              <div className="budget-filter-tabs" aria-label="Filter transactions">
                {["all", "income", "expense"].map((type) => (
                  <button className={filter === type ? "is-active" : ""} key={type} onClick={() => setFilter(type)}>
                    {type === "expense" ? "Expenses" : type[0].toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {filteredTransactions.length ? (
              <>
                <div className="budget-table-wrap">
                  <table className="budget-table">
                    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th aria-label="Actions" /></tr></thead>
                    <tbody>
                      {filteredTransactions.slice(0, 8).map((transaction) => {
                        const details = getCategoryDetails(transaction.type, transaction.category);
                        const CategoryIcon = categoryIcons[transaction.category] || CircleDollarSign;
                        return (
                          <tr key={transaction._id}>
                            <td>{parseTransactionDate(transaction.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</td>
                            <td className="budget-description-cell">{transaction.description || details.label}</td>
                            <td><span className={`budget-category-pill ${transaction.type}`}>
                              <CategoryIcon size={13} />{details.label}
                            </span></td>
                            <td className={`budget-amount-cell ${transaction.type}`}>
                              {transaction.type === "income" ? "+" : "−"}{formatCurrency(toAmount(transaction))}
                            </td>
                            <td>
                              <div className="budget-row-actions">
                                <button onClick={() => handleEdit(transaction)} aria-label="Edit transaction" title="Edit">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => setDeleteConfirm(transaction._id)} aria-label="Delete transaction" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              {deleteConfirm === transaction._id && (
                                <div className="budget-delete-popover" role="alertdialog">
                                  <span>Delete this transaction?</span>
                                  <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                  <button className="confirm" onClick={() => handleDelete(transaction._id)}>Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredTransactions.length > 8 && (
                  <p className="budget-showing-note">Showing the latest 8 of {filteredTransactions.length} transactions.</p>
                )}
              </>
            ) : (
              <div className="budget-small-empty">
                {searchQuery ? "No transactions match that search." : filter === "all" ? "No transactions yet. Add your first one to get started." : `No ${filter} transactions yet.`}
              </div>
            )}
          </article>
        </section>

        <section className="budget-bottom-banner">
          <span className="budget-banner-icon"><Sparkles size={22} /></span>
          <div><span className="budget-eyebrow">SMART SPENDING STARTS HERE</span><h2>Small steps today.<br /><span>Bigger opportunities tomorrow.</span></h2></div>
          <button onClick={() => openForm("expense")}><Plus size={15} /> Track an expense</button>
        </section>
      </div>

      {showForm && (
        <div className="budget-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="budget-modal" role="dialog" aria-modal="true" aria-labelledby="budget-form-title">
            <div className="budget-modal-heading">
              <div><span className="budget-eyebrow">{editingId ? "UPDATE YOUR RECORD" : "KEEP IT TRACKED"}</span>
                <h2 id="budget-form-title">{editingId ? "Edit transaction" : "Add a transaction"}</h2></div>
              <button className="budget-modal-close" onClick={closeForm} aria-label="Close form"><X size={19} /></button>
            </div>
            <div className="budget-type-switch">
              <button className={formData.type === "expense" ? "is-expense" : ""} onClick={() => {
                setFormData((current) => ({ ...current, type: "expense", category: "" }));
                setBalanceWarning("");
              }}><ArrowUpRight size={16} /> Expense</button>
              <button className={formData.type === "income" ? "is-income" : ""} onClick={() => {
                setFormData((current) => ({ ...current, type: "income", category: "" }));
                setBalanceWarning("");
              }}><ArrowDownLeft size={16} /> Income</button>
            </div>
            {balanceWarning && <div className="budget-balance-warning" role="alert">{balanceWarning}</div>}
            <form onSubmit={handleSubmit}>
              <div className="budget-form-grid">
                <label className="budget-form-field budget-form-wide">
                  <span>Category</span>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Choose a category</option>
                    {(formData.type === "income" ? incomeCategories : expenseCategories).map((category) => (
                      <option key={category.value} value={category.value}>{category.icon} {category.label}</option>
                    ))}
                  </select>
                </label>
                <label className="budget-form-field">
                  <span>Amount (USD)</span>
                  <input type="number" name="amount" min="0.01" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0.00" required />
                </label>
                <label className="budget-form-field">
                  <span>Date</span>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </label>
                <label className="budget-form-field budget-form-wide">
                  <span>Description <small>{100 - formData.description.length} characters left</small></span>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} maxLength={100} placeholder="What was this transaction for?" />
                </label>
              </div>
              <div className="budget-modal-actions">
                <button className="budget-cancel-button" type="button" onClick={closeForm}>Cancel</button>
                <button className="budget-save-button" type="submit">
                  <Plus size={16} /> {editingId ? "Save changes" : "Save transaction"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Budget;
