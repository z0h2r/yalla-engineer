import { useState } from 'react';

const commonIngredients = [
  { name: 'Flour', unit: 'cups' },
  { name: 'Sugar', unit: 'cups' },
  { name: 'Butter', unit: 'tbsp' },
  { name: 'Eggs', unit: 'whole' },
  { name: 'Milk', unit: 'cups' },
  { name: 'Salt', unit: 'tsp' },
  { name: 'Vanilla', unit: 'tsp' },
  { name: 'Olive Oil', unit: 'tbsp' },
];

const unitConversions = {
  'cups': { tsp: 48, tbsp: 16, ml: 240, oz: 8 },
  'tbsp': { tsp: 3, cups: 1/16, ml: 15, oz: 0.5 },
  'tsp': { tbsp: 1/3, cups: 1/48, ml: 5, oz: 1/6 },
  'ml': { cups: 1/240, tbsp: 1/15, tsp: 1/5, oz: 1/30 },
  'oz': { cups: 1/8, tbsp: 2, tsp: 6, ml: 30 },
};

export default function RecipeScaler() {
  const [originalServings, setOriginalServings] = useState(4);
  const [desiredServings, setDesiredServings] = useState(6);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Flour', amount: 2, unit: 'cups' },
    { id: 2, name: 'Sugar', amount: 1, unit: 'cups' },
    { id: 3, name: 'Eggs', amount: 3, unit: 'whole' },
  ]);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: 'cups' });

  const scalingFactor = desiredServings / originalServings;

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now(),
          name: newIngredient.name,
          amount: parseFloat(newIngredient.amount),
          unit: newIngredient.unit,
        },
      ]);
      setNewIngredient({ name: '', amount: '', unit: 'cups' });
    }
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id 
        ? { ...ing, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
        : ing
    ));
  };

  const formatAmount = (amount) => {
    const scaled = amount * scalingFactor;
    
    // Handle fractions nicely
    if (scaled < 1) {
      const fraction = scaled;
      if (Math.abs(fraction - 1/4) < 0.01) return '1/4';
      if (Math.abs(fraction - 1/3) < 0.01) return '1/3';
      if (Math.abs(fraction - 1/2) < 0.01) return '1/2';
      if (Math.abs(fraction - 2/3) < 0.01) return '2/3';
      if (Math.abs(fraction - 3/4) < 0.01) return '3/4';
    }
    
    // For larger amounts, show decimals only if needed
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
  };

  const suggestBetterUnit = (amount, currentUnit) => {
    const scaled = amount * scalingFactor;
    
    if (!unitConversions[currentUnit]) return null;
    
    // Suggest conversion if the scaled amount is very small or very large
    if (scaled < 0.25 && unitConversions[currentUnit].tsp) {
      const inTsp = scaled * unitConversions[currentUnit].tsp;
      if (inTsp >= 1) return { amount: inTsp.toFixed(1), unit: 'tsp' };
    }
    
    if (scaled > 16 && currentUnit === 'tbsp') {
      const inCups = scaled * unitConversions[currentUnit].cups;
      if (inCups >= 1) return { amount: inCups.toFixed(2), unit: 'cups' };
    }
    
    return null;
  };

  const quickAddIngredient = (ingredient) => {
    setNewIngredient({ ...ingredient, amount: '1' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-600 mb-2">👨‍🍳 Recipe Scaler</h2>
        <p className="text-gray-600">Scale any recipe up or down for perfect portions</p>
      </div>

      {/* Serving Size Controls */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 mb-8">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Original Recipe Serves:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={originalServings}
              onChange={(e) => setOriginalServings(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-bold text-center"
            />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-black text-orange-600 mb-2">
              {scalingFactor > 1 ? '📈' : scalingFactor < 1 ? '📉' : '➡️'}
            </div>
            <div className="text-sm font-bold text-gray-600">
              {scalingFactor > 1 ? 'Scaling Up' : scalingFactor < 1 ? 'Scaling Down' : 'Same Size'}
            </div>
            <div className="text-lg font-black text-orange-600">
              {scalingFactor.toFixed(2)}x
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">I Want to Serve:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={desiredServings}
              onChange={(e) => setDesiredServings(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-bold text-center"
            />
          </div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="mb-8">
        <h3 className="text-2xl font-black mb-6 text-gray-800 flex items-center">
          <span className="mr-3">🥘</span>
          Ingredients
        </h3>
        
        <div className="space-y-4">
          {ingredients.map((ingredient) => {
            const suggestion = suggestBetterUnit(ingredient.amount, ingredient.unit);
            return (
              <div key={ingredient.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-semibold"
                      placeholder="Ingredient name"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      step="0.25"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                    />
                  </div>
                  
                  <div>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="cups">cups</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="ml">ml</option>
                      <option value="oz">oz</option>
                      <option value="lbs">lbs</option>
                      <option value="whole">whole</option>
                      <option value="cloves">cloves</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-black text-green-600">
                        {formatAmount(ingredient.amount)} {ingredient.unit}
                      </div>
                      {suggestion && (
                        <div className="text-xs text-blue-600 font-semibold">
                          or {suggestion.amount} {suggestion.unit}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="ml-3 text-red-500 hover:text-red-700 text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Ingredient */}
      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 mb-8">
        <h4 className="font-bold text-blue-800 mb-4">Add Ingredient</h4>
        
        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {commonIngredients.map((ingredient, index) => (
            <button
              key={index}
              onClick={() => quickAddIngredient(ingredient)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              + {ingredient.name}
            </button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              placeholder="Ingredient name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <input
              type="number"
              step="0.25"
              value={newIngredient.amount}
              onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
              placeholder="Amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
            />
          </div>
          
          <div>
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="cups">cups</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="ml">ml</option>
              <option value="oz">oz</option>
              <option value="lbs">lbs</option>
              <option value="whole">whole</option>
              <option value="cloves">cloves</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={addIngredient}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          ➕ Add Ingredient
        </button>
      </div>

      {/* Cooking Tips */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <h4 className="font-bold text-green-800 mb-2">🍳 Scaling Tips:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Spices & Salt:</strong> Scale conservatively - taste and adjust</li>
          <li>• <strong>Baking:</strong> Chemical leaveners (baking powder/soda) scale precisely</li>
          <li>• <strong>Cooking Time:</strong> May need adjustment - larger portions cook slower</li>
          <li>• <strong>Pan Size:</strong> Consider if your cookware can handle the scaled recipe</li>
        </ul>
      </div>
    </div>
  );
} 