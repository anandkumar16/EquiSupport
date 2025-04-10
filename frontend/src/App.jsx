import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    husbandIncome: '',
    numberOfChildren: '',
    propertyValue: '',
    landValue: '',
    marriageDuration: '',
    womanIncome: '',
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const fields = Object.keys(formData);
    fields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      } else if (isNaN(formData[field])) {
        newErrors[field] = 'Must be a number';
      } else if (Number(formData[field]) < 0) {
        newErrors[field] = 'Must be positive';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch('https://api-alimony-calculator.onrender.com/calculate-alimony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          husbandIncome: Number(formData.husbandIncome),
          numberOfChildren: Number(formData.numberOfChildren),
          propertyValue: Number(formData.propertyValue),
          landValue: Number(formData.landValue),
          marriageDuration: Number(formData.marriageDuration),
          womanIncome: Number(formData.womanIncome),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Calculation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-2">Alimony Calculator</h1>
        <p className="text-center text-gray-600 mb-6">Know your rights. Calculate fair maintenance support.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['husbandIncome', "Husband's Monthly Income (₹)"],
            ['womanIncome', "Your Monthly Income (₹)"],
            ['numberOfChildren', "Number of Children"],
            ['marriageDuration', "Marriage Duration (Years)"],
            ['propertyValue', "Total Property Value (₹)"],
            ['landValue', "Total Land Value (₹)"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
          ))}

          <div className="col-span-1 md:col-span-2 text-center mt-4">
            <button type="submit" className="bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Calculate Alimony
            </button>
            {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
          </div>
        </form>

        {result && (
          <div className="mt-8 bg-pink-50 p-6 rounded-xl border-l-4 border-pink-400">
            <h2 className="text-xl font-bold text-purple-700 mb-4">Alimony Calculation Results</h2>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-pink-600">{formatCurrency(result.alimony)} <small className="text-lg">/month</small></p>
              <p className="text-sm text-gray-600">{result.percentage}% of husband's income</p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <strong>Note:</strong> This is an estimate based on Indian alimony practices. Actual court decisions may vary.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;