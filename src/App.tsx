import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter
} from "recharts";
import { Trash2, Calculator } from "lucide-react";
import { calculateStats } from "./utils/statistics";

function App() {
  const [rowsLimit, setRowsLimit] = useState("");
  const [currentInput, setCurrentInput] = useState({
    classInterval: "",
    frequency: ""
  });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [showCalculateButton, setShowCalculateButton] = useState(false);
  const [showProblemButtons, setShowProblemButtons] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [calculations, setCalculations] = useState(null);

  const statisticalProblems = [
    "Mean, Median & Mode (Discrete Data)",
    "Median & Mode (Continuous Data)",
    "Mean Deviation & Std Dev (Discrete Data)",
    "Mean Deviation & Std Dev (Continuous Data)",
    "Skewness & Kurtosis",
    "Correlation Coefficient",
    "Regression (Y on X)",
    "Regression (X on Y)",
    "Straight Line Fit",
    "Parabola Fit",
    "Exponential Curve Fit",
    "Power Curve Fit"
  ];

  const isValidClassInterval = (interval) => {
    const pattern = /^\d+-\d+$/;
    if (!pattern.test(interval)) return false;
    const [min, max] = interval.split("-").map(Number);
    return min < max;
  };

  const handleRowsLimitChange = (e) => {
    const value = e.target.value;
    if (value && value > 0) {
      setRowsLimit(parseInt(value));
      if (parseInt(value) < rows.length) {
        setRows([]);
        setShowCalculateButton(false);
        setShowProblemButtons(false);
      }
    } else {
      setRowsLimit("");
    }
  };

  const handleInputChange = (e, field) => {
    setCurrentInput(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddRow = () => {
    setError("");

    if (!rowsLimit) {
      setError("Please set a rows limit first");
      return;
    }

    if (!isValidClassInterval(currentInput.classInterval)) {
      setError("Class interval must be in format 'x-x' (e.g., 10-20)");
      return;
    }

    if (!currentInput.frequency || isNaN(currentInput.frequency) || currentInput.frequency <= 0) {
      setError("Frequency must be a positive number");
      return;
    }

    if (rows.length >= rowsLimit) {
      setError("Row limit reached");
      return;
    }

    const newRow = {
      id: Date.now(),
      classInterval: currentInput.classInterval,
      frequency: parseInt(currentInput.frequency)
    };

    const newRows = [...rows, newRow];
    setRows(newRows);
    setCurrentInput({ classInterval: "", frequency: "" });

    if (newRows.length === rowsLimit) {
      setShowCalculateButton(true);
    }
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
    setShowCalculateButton(false);
    setShowProblemButtons(false);
    setSelectedProblem(null);
    setCalculations(null);
  };

  const handleCalculate = () => {
    setShowProblemButtons(true);
  };

  const handleProblemSelection = (type) => {
    setSelectedProblem(type);
    const results = calculateStats(type, rows);
    setCalculations(results);
  };

  const formatTableValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      if (value.x !== undefined && value.y !== undefined) {
        return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
      }
      return JSON.stringify(value);
    }
    if (typeof value === 'number') return value.toFixed(2);
    return value;
  };

  const shouldShowVisualization = (type) => {
    return ![
      "Correlation Coefficient",
      "Regression (Y on X)",
      "Regression (X on Y)"
    ].includes(type);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Statistical Analysis Dashboard</h1>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="number"
                placeholder="Rows Limit"
                value={rowsLimit}
                onChange={handleRowsLimitChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <input
                type="text"
                placeholder="Class Interval (e.g., 10-20)"
                value={currentInput.classInterval}
                onChange={(e) => handleInputChange(e, 'classInterval')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Frequency"
                value={currentInput.frequency}
                onChange={(e) => handleInputChange(e, 'frequency')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button 
                onClick={handleAddRow}
                disabled={!rowsLimit || rows.length >= rowsLimit}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Row
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {rows.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Interval
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{row.classInterval}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.frequency}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showCalculateButton && !showProblemButtons && (
            <button 
              onClick={handleCalculate}
              className="mt-8 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Calculate
            </button>
          )}

          {showProblemButtons && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statisticalProblems.map((problem) => (
                <button
                  key={problem}
                  onClick={() => handleProblemSelection(problem)}
                  className={`p-4 text-white rounded-lg transition-colors ${
                    selectedProblem === problem 
                      ? 'bg-blue-700 shadow-lg' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {problem}
                </button>
              ))}
            </div>
          )}

          {selectedProblem && calculations && (
            <div className="mt-8 space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedProblem}</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Formulas</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      {Object.entries(calculations.formulas).map(([key, formula]) => (
                        <p key={key} className="mb-2">
                          <span className="font-medium capitalize">{key}: </span>
                          {formula}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Steps</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(calculations.steps.calculationTable[0]).map(key => (
                              <th 
                                key={key} 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {calculations.steps.calculationTable.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="px-6 py-4 whitespace-nowrap">
                                  {formatTableValue(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Final Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Measure
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(calculations.results).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {formatTableValue(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {shouldShowVisualization(selectedProblem) && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Visualizations</h3>
                      <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                          <BarChart 
                            width={800} 
                            height={300} 
                            data={calculations.steps.calculationTable}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="classInterval" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="frequency" fill="#3B82F6" name="Frequency" />
                          </BarChart>
                        </div>

                        {(calculations.results.fittedLine || calculations.results.fittedCurve) && (
                          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                            <ScatterChart
                              width={800}
                              height={300}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" dataKey="x" name="X" />
                              <YAxis type="number" dataKey="y" name="Y" />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              <Scatter
                                name="Data Points"
                                data={calculations.steps.calculationTable}
                                fill="#3B82F6"
                              />
                              <Line
                                type="monotone"
                                data={calculations.results.fittedLine || calculations.results.fittedCurve}
                                dataKey="y"
                                stroke="#10B981"
                                name="Fitted Line"
                                dot={false}
                              />
                            </ScatterChart>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;