'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    beans: '',
    grind: '',
    dose: '',
    yield: '',
    time: '',
    notes: ''
  });

  const [editingId, setEditingId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('mengupi_recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    } else {
      const defaultRecipes = [
        {
          id: 1,
          name: "House Espresso Blend",
          beans: "Ethiopia + Colombia (Medium Roast)",
          grind: "12",
          dose: "18g",
          yield: "36g",
          time: "28s",
          notes: "Bright citrus notes with a sweet milk chocolate finish. Perfectly balanced."
        },
        {
          id: 2,
          name: "Morning Latte Shot",
          beans: "Brazil Santos (Medium-Dark)",
          grind: "14",
          dose: "18.5g",
          yield: "40g",
          time: "26s",
          notes: "Nutty and low acidity. Cuts through milk wonderfully for a creamy flat white."
        }
      ];
      setRecipes(defaultRecipes);
      localStorage.setItem('mengupi_recipes', JSON.stringify(defaultRecipes));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem('mengupi_recipes', JSON.stringify(recipes));
    }
  }, [recipes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grind || !formData.dose || !formData.yield || !formData.time) {
      alert('Please fill in the profile name and all extraction parameters!');
      return;
    }

    // Strips any accidental units the user typed, keeping just the clean number/decimal
    const cleanNumber = (val) => val.replace(/[^\d.]/g, '');

    if (editingId) {
      setRecipes(recipes.map(recipe => {
        if (recipe.id === editingId) {
          return {
            ...recipe,
            name: formData.name,
            beans: formData.beans || 'Unspecified Beans',
            grind: formData.grind,
            dose: `${cleanNumber(formData.dose)}g`,
            yield: `${cleanNumber(formData.yield)}g`,
            time: `${cleanNumber(formData.time)}s`,
            notes: formData.notes || 'No extra tasting notes recorded.'
          };
        }
        return recipe;
      }));
      setEditingId(null);
    } else {
      const newRecipe = {
        id: Date.now(),
        name: formData.name,
        beans: formData.beans || 'Unspecified Beans',
        grind: formData.grind,
        dose: `${cleanNumber(formData.dose)}g`,
        yield: `${cleanNumber(formData.yield)}g`,
        time: `${cleanNumber(formData.time)}s`,
        notes: formData.notes || 'No extra tasting notes recorded.'
      };
      setRecipes([newRecipe, ...recipes]);
    }

    setFormData({ name: '', beans: '', grind: '', dose: '', yield: '', time: '', notes: '' });
  };

  const startEdit = (recipe, e) => {
    e.stopPropagation();
    setEditingId(recipe.id);
    // When editing, strip the unit letters so the user just sees the raw numbers in the inputs
    const stripUnit = (val) => val ? val.replace(/[^\d.]/g, '') : '';
    
    setFormData({
      name: recipe.name,
      beans: recipe.beans,
      grind: recipe.grind,
      dose: stripUnit(recipe.dose),
      yield: stripUnit(recipe.yield),
      time: stripUnit(recipe.time),
      notes: recipe.notes
    });
  };

  const deleteRecipe = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this extraction log?')) {
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(updatedRecipes);
      if (updatedRecipes.length === 0) {
        localStorage.setItem('mengupi_recipes', JSON.stringify([]));
      }
      if (editingId === id) {
        setEditingId(null);
        setFormData({ name: '', beans: '', grind: '', dose: '', yield: '', time: '', notes: '' });
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', beans: '', grind: '', dose: '', yield: '', time: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-amber-100">
      
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/80 backdrop-blur-md border-b border-stone-200/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-amber-900">☕ Mengupi.BN</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-stone-600">
            <a href="#" className="hover:text-amber-800 transition-colors">Home</a>
            <a href="#" className="hover:text-amber-800 transition-colors">Recipes</a>
            <a href="#" className="hover:text-amber-800 transition-colors">History</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          Home Barista Journal
        </span>
        <h1 className="text-4xl font-black text-stone-900 tracking-tight mt-3 mb-3">
          The Art of Espresso Extraction
        </h1>
        <p className="text-base text-stone-600 max-w-xl mx-auto">
          Log grind sizes, precise dosing, and shot times to dial in the perfect flavor profile.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24 grid gap-8 md:grid-cols-3 items-start">
        
        {/* LOG FORM */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm md:col-span-1">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-800">
              {editingId ? "✏️ Edit Extraction" : "Log New Extraction"}
            </h2>
            {editingId && (
              <button 
                onClick={cancelEdit}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Profile Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="e.g., Morning Espresso" 
                className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Coffee Beans</label>
              <input 
                type="text" name="beans" value={formData.beans} onChange={handleInputChange}
                placeholder="e.g., Blend or Single Origin" 
                className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
              />
            </div>
            
            {/* 3-Column Param Grid with Inline Units */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Grind</label>
                <input 
                  type="text" name="grind" value={formData.grind} onChange={handleInputChange}
                  placeholder="12" 
                  className="w-full text-xs p-2.5 text-center border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Dose</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" name="dose" value={formData.dose} onChange={handleInputChange}
                    placeholder="18" 
                    className="w-full text-xs p-2.5 pr-5 text-center border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
                  />
                  <span className="absolute right-2 text-[10px] font-bold text-stone-400 pointer-events-none">g</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Yield</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" name="yield" value={formData.yield} onChange={handleInputChange}
                    placeholder="36" 
                    className="w-full text-xs p-2.5 pr-5 text-center border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
                  />
                  <span className="absolute right-2 text-[10px] font-bold text-stone-400 pointer-events-none">g</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Extraction Time</label>
              <div className="relative flex items-center">
                <input 
                  type="text" name="time" value={formData.time} onChange={handleInputChange}
                  placeholder="28" 
                  className="w-full text-xs p-2.5 pr-7 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
                />
                <span className="absolute right-3 text-[10px] font-bold text-stone-400 pointer-events-none">sec</span>
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">Tasting Notes</label>
              <textarea 
                name="notes" value={formData.notes} onChange={handleInputChange} rows="2"
                placeholder="How did the shot taste?" 
                className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50 resize-none"
              />
            </div>

            <button 
              type="submit"
              className={`w-full text-white font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer mt-2 shadow-sm ${
                editingId ? "bg-amber-700 hover:bg-amber-800" : "bg-amber-800 hover:bg-amber-900"
              }`}
            >
              {editingId ? "Update Log Entry" : "Save Extraction"}
            </button>
          </form>
        </section>

        {/* RECIPES GRID */}
        <section className="md:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
            <h2 className="text-base font-bold text-stone-800">Recent Extractions</h2>
            <span className="text-xs text-stone-500 font-medium">{recipes.length} Logs</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-2 pr-16">
                    <h3 className="font-bold text-base text-stone-950 group-hover:text-amber-900 transition-colors">
                      {recipe.name}
                    </h3>
                    <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-md border border-stone-200/60">
                      {recipe.time}
                    </span>
                  </div>
                  
                  <div className="absolute top-5 right-5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={(e) => startEdit(recipe, e)}
                      className="text-[11px] bg-stone-100 hover:bg-amber-50 border border-stone-200 text-stone-600 hover:text-amber-800 px-2 py-1 rounded-md transition-all cursor-pointer font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => deleteRecipe(recipe.id, e)}
                      className="text-[11px] bg-stone-100 hover:bg-red-50 border border-stone-200 text-stone-500 hover:text-red-600 px-2 py-1 rounded-md transition-all cursor-pointer font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <p className="text-xs text-stone-500 mb-3 font-medium italic">
                    {recipe.beans}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 mb-3 text-center">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Grind</span>
                      <span className="text-xs font-bold text-stone-700">{recipe.grind}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Dose</span>
                      <span className="text-xs font-bold text-stone-700">{recipe.dose}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Yield</span>
                      <span className="text-xs font-bold text-stone-700">{recipe.yield}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2.5 mt-1">
                  {recipe.notes}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}