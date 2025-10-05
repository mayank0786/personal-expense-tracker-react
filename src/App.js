import React, { useState, useEffect } from 'react';
import './App.css';

// Initial state for the form. Using a constant like this
// helps avoid "magic strings" and makes resetting the form easy.
const INITIAL_FORM_STATE = {
  amount: '',
  date: '',
  note: '',
};

function App() {
  // State to hold the list of all expenses
  const [expenses, setExpenses] = useState([]);

  // Use a single state object for the form. This is cleaner
  // than managing multiple state variables for each input.
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // State to track if we're editing an expense. `null` means we're adding.
  // A number (the expense ID) means we're editing.
  const [editingId, setEditingId] = useState(null);

  // --- Side Effects (Loading and Saving Data) ---

  // Effect to LOAD expenses from localStorage when the component first mounts.
  // The empty dependency array [] ensures this runs only once.
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage", error);
    }
  }, []);

  // Effect to SAVE expenses to localStorage whenever the `expenses` state changes.
  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage", error);
    }
  }, [expenses]); // This effect depends on the `expenses` state.

  // --- Event Handlers ---

  // A single handler to update the formData state as the user types.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles both adding a new expense and updating an existing one.
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent the browser from reloading the page

    // Simple validation to ensure no fields are empty.
    if (!formData.amount || !formData.date || !formData.note) {
      alert('Please fill out all fields.');
      return;
    }

    const isEditing = editingId !== null;

    if (isEditing) {
      // Find the expense by its ID and update it.
      const updatedExpenses = expenses.map((expense) =>
        expense.id === editingId ? { ...expense, ...formData } : expense
      );
      setExpenses(updatedExpenses);
    } else {
      // Add a new expense with a unique ID (timestamp).
      const newExpense = {
        id: Date.now(),
        ...formData,
      };
      // Adding the new expense to the beginning of the array (newer first).
      setExpenses([newExpense, ...expenses]);
    }

    // Clean up after submission.
    resetForm();
  };

  // Sets up the form for editing an existing expense.
  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setFormData({
      amount: expense.amount,
      date: expense.date,
      note: expense.note,
    });
  };

  // Deletes an expense from the list.
  const handleDeleteClick = (id) => {
    // We ask for confirmation, which is good UX!
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      setExpenses(updatedExpenses);
    }
  };

  // A helper function to reset the form and exit editing mode.
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  // --- Render ---

  const isEditing = editingId !== null;

  return (
    <div className="app-container">
      <h1>Expense Tracker</h1>

      <form className="expense-form" onSubmit={handleFormSubmit}>
        <h2>{isEditing ? 'Update Expense' : 'Add New Expense'}</h2>
        <input
          className="form-input"
          type="number"
          name="amount"
          placeholder="Amount (e.g., 25.50)"
          value={formData.amount}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          type="text"
          name="note"
          placeholder="Note (e.g., 'Coffee with friends')"
          value={formData.note}
          onChange={handleInputChange}
        />
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
          {/* A very human-friendly feature: a cancel button! */}
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="expense-list">
        <h2>Your Expenses</h2>
        {expenses.length === 0 ? (
          <p className="empty-list-message">No expenses recorded yet. Time to add one!</p>
        ) : (
          <ul>
            {expenses.map((expense) => (
              <li key={expense.id} className="expense-item">
                <div className="expense-details">
                  <span className="date">{expense.date}</span>
                  <span className="note">{expense.note}</span>
                  <span className="amount">${parseFloat(expense.amount).toFixed(2)}</span>
                </div>
                <div className="expense-actions">
                  <button className="btn btn-edit" onClick={() => handleEditClick(expense)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDeleteClick(expense.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;