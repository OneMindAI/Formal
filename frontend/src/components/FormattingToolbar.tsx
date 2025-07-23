import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, Type, Palette, 
  Subscript, Superscript, Hash, List, 
  Sigma, Pi, Infinity, Square, Triangle,
  Calculator, Function, Target, Settings
} from 'lucide-react';

interface FormattingToolbarProps {
  onInsert: (text: string) => void;
  darkMode: boolean;
}

interface MathSymbol {
  symbol: string;
  latex: string;
  category: string;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onInsert, darkMode }) => {
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  const [showMathPanel, setShowMathPanel] = useState(false);

  // Mathematical symbols organized by category
  const mathSymbols: { [key: string]: MathSymbol[] } = {
    basic: [
      { symbol: '±', latex: '\\pm', category: 'basic' },
      { symbol: '∓', latex: '\\mp', category: 'basic' },
      { symbol: '×', latex: '\\times', category: 'basic' },
      { symbol: '÷', latex: '\\div', category: 'basic' },
      { symbol: '≠', latex: '\\neq', category: 'basic' },
      { symbol: '≤', latex: '\\leq', category: 'basic' },
      { symbol: '≥', latex: '\\geq', category: 'basic' },
      { symbol: '≈', latex: '\\approx', category: 'basic' },
      { symbol: '∞', latex: '\\infty', category: 'basic' },
      { symbol: '∂', latex: '\\partial', category: 'basic' },
      { symbol: '∇', latex: '\\nabla', category: 'basic' },
      { symbol: '√', latex: '\\sqrt{}', category: 'basic' },
    ],
    greek: [
      { symbol: 'α', latex: '\\alpha', category: 'greek' },
      { symbol: 'β', latex: '\\beta', category: 'greek' },
      { symbol: 'γ', latex: '\\gamma', category: 'greek' },
      { symbol: 'δ', latex: '\\delta', category: 'greek' },
      { symbol: 'ε', latex: '\\epsilon', category: 'greek' },
      { symbol: 'ζ', latex: '\\zeta', category: 'greek' },
      { symbol: 'η', latex: '\\eta', category: 'greek' },
      { symbol: 'θ', latex: '\\theta', category: 'greek' },
      { symbol: 'λ', latex: '\\lambda', category: 'greek' },
      { symbol: 'μ', latex: '\\mu', category: 'greek' },
      { symbol: 'π', latex: '\\pi', category: 'greek' },
      { symbol: 'σ', latex: '\\sigma', category: 'greek' },
      { symbol: 'τ', latex: '\\tau', category: 'greek' },
      { symbol: 'φ', latex: '\\phi', category: 'greek' },
      { symbol: 'ψ', latex: '\\psi', category: 'greek' },
      { symbol: 'ω', latex: '\\omega', category: 'greek' },
      { symbol: 'Γ', latex: '\\Gamma', category: 'greek' },
      { symbol: 'Δ', latex: '\\Delta', category: 'greek' },
      { symbol: 'Θ', latex: '\\Theta', category: 'greek' },
      { symbol: 'Λ', latex: '\\Lambda', category: 'greek' },
      { symbol: 'Π', latex: '\\Pi', category: 'greek' },
      { symbol: 'Σ', latex: '\\Sigma', category: 'greek' },
      { symbol: 'Φ', latex: '\\Phi', category: 'greek' },
      { symbol: 'Ψ', latex: '\\Psi', category: 'greek' },
      { symbol: 'Ω', latex: '\\Omega', category: 'greek' },
    ],
    calculus: [
      { symbol: '∫', latex: '\\int', category: 'calculus' },
      { symbol: '∬', latex: '\\iint', category: 'calculus' },
      { symbol: '∭', latex: '\\iiint', category: 'calculus' },
      { symbol: '∮', latex: '\\oint', category: 'calculus' },
      { symbol: '∑', latex: '\\sum', category: 'calculus' },
      { symbol: '∏', latex: '\\prod', category: 'calculus' },
      { symbol: 'lim', latex: '\\lim', category: 'calculus' },
      { symbol: '∂/∂x', latex: '\\frac{\\partial}{\\partial x}', category: 'calculus' },
      { symbol: 'd/dx', latex: '\\frac{d}{dx}', category: 'calculus' },
      { symbol: '∇', latex: '\\nabla', category: 'calculus' },
      { symbol: '∇²', latex: '\\nabla^2', category: 'calculus' },
      { symbol: '△', latex: '\\triangle', category: 'calculus' },
    ],
    sets: [
      { symbol: '∈', latex: '\\in', category: 'sets' },
      { symbol: '∉', latex: '\\notin', category: 'sets' },
      { symbol: '⊂', latex: '\\subset', category: 'sets' },
      { symbol: '⊃', latex: '\\supset', category: 'sets' },
      { symbol: '⊆', latex: '\\subseteq', category: 'sets' },
      { symbol: '⊇', latex: '\\supseteq', category: 'sets' },
      { symbol: '∪', latex: '\\cup', category: 'sets' },
      { symbol: '∩', latex: '\\cap', category: 'sets' },
      { symbol: '∅', latex: '\\emptyset', category: 'sets' },
      { symbol: 'ℕ', latex: '\\mathbb{N}', category: 'sets' },
      { symbol: 'ℤ', latex: '\\mathbb{Z}', category: 'sets' },
      { symbol: 'ℚ', latex: '\\mathbb{Q}', category: 'sets' },
      { symbol: 'ℝ', latex: '\\mathbb{R}', category: 'sets' },
      { symbol: 'ℂ', latex: '\\mathbb{C}', category: 'sets' },
    ],
    logic: [
      { symbol: '∧', latex: '\\land', category: 'logic' },
      { symbol: '∨', latex: '\\lor', category: 'logic' },
      { symbol: '¬', latex: '\\neg', category: 'logic' },
      { symbol: '→', latex: '\\to', category: 'logic' },
      { symbol: '↔', latex: '\\leftrightarrow', category: 'logic' },
      { symbol: '⇒', latex: '\\Rightarrow', category: 'logic' },
      { symbol: '⇔', latex: '\\Leftrightarrow', category: 'logic' },
      { symbol: '∀', latex: '\\forall', category: 'logic' },
      { symbol: '∃', latex: '\\exists', category: 'logic' },
      { symbol: '∄', latex: '\\nexists', category: 'logic' },
      { symbol: '⊢', latex: '\\vdash', category: 'logic' },
      { symbol: '⊨', latex: '\\models', category: 'logic' },
    ]
  };

  // Text formatting functions
  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        onInsert('\\textbf{text}');
        break;
      case 'italic':
        onInsert('\\textit{text}');
        break;
      case 'underline':
        onInsert('\\underline{text}');
        break;
      case 'subscript':
        onInsert('_{subscript}');
        break;
      case 'superscript':
        onInsert('^{superscript}');
        break;
      case 'fraction':
        onInsert('\\frac{numerator}{denominator}');
        break;
      case 'sqrt':
        onInsert('\\sqrt{content}');
        break;
      case 'equation':
        onInsert('\\begin{equation}\n\n\\end{equation}');
        break;
      case 'align':
        onInsert('\\begin{align}\n\n\\end{align}');
        break;
      case 'matrix':
        onInsert('\\begin{matrix}\na & b \\\\\nc & d\n\\end{matrix}');
        break;
    }
  };

  // Insert document structure
  const insertStructure = (type: string) => {
    switch (type) {
      case 'section':
        onInsert('\\section{Section Title}');
        break;
      case 'subsection':
        onInsert('\\subsection{Subsection Title}');
        break;
      case 'itemize':
        onInsert('\\begin{itemize}\n\\item First item\n\\item Second item\n\\end{itemize}');
        break;
      case 'enumerate':
        onInsert('\\begin{enumerate}\n\\item First item\n\\item Second item\n\\end{enumerate}');
        break;
      case 'table':
        onInsert('\\begin{table}[h]\n\\centering\n\\begin{tabular}{|c|c|}\n\\hline\nHeader 1 & Header 2 \\\\\n\\hline\nData 1 & Data 2 \\\\\n\\hline\n\\end{tabular}\n\\caption{Table caption}\n\\end{table}');
        break;
      case 'figure':
        onInsert('\\begin{figure}[h]\n\\centering\n% \\includegraphics[width=0.5\\textwidth]{image.png}\n\\caption{Figure caption}\n\\label{fig:label}\n\\end{figure}');
        break;
    }
  };

  // Color options
  const colors = [
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
  ];

  // Font sizes
  const fontSizes = [
    { name: 'Tiny', command: '\\tiny' },
    { name: 'Script', command: '\\scriptsize' },
    { name: 'Footnote', command: '\\footnotesize' },
    { name: 'Small', command: '\\small' },
    { name: 'Normal', command: '\\normalsize' },
    { name: 'Large', command: '\\large' },
    { name: 'Large+', command: '\\Large' },
    { name: 'LARGE', command: '\\LARGE' },
    { name: 'Huge', command: '\\huge' },
    { name: 'HUGE', command: '\\Huge' },
  ];

  return (
    <div className={`formatting-toolbar liquid-glass border-b border-white/20 p-3 ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
          <button
            onClick={() => formatText('bold')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Bold (\\textbf)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => formatText('italic')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Italic (\\textit)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => formatText('underline')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Underline (\\underline)"
          >
            <Underline size={16} />
          </button>
        </div>

        {/* Math Formatting */}
        <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
          <button
            onClick={() => formatText('subscript')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Subscript"
          >
            <Subscript size={16} />
          </button>
          <button
            onClick={() => formatText('superscript')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Superscript"
          >
            <Superscript size={16} />
          </button>
          <button
            onClick={() => formatText('fraction')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Fraction (\\frac)"
          >
            <span className="text-sm font-mono">a/b</span>
          </button>
          <button
            onClick={() => formatText('sqrt')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Square Root (\\sqrt)"
          >
            <Square size={16} />
          </button>
        </div>

        {/* Mathematical Symbols */}
        <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
          <button
            onClick={() => setShowMathPanel(!showMathPanel)}
            className={`liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20 ${showMathPanel ? 'bg-blue-500/20' : ''}`}
            title="Mathematical Symbols"
          >
            <Sigma size={16} />
          </button>
          <button
            onClick={() => formatText('equation')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Equation Environment"
          >
            <Calculator size={16} />
          </button>
          <button
            onClick={() => formatText('align')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Align Environment"
          >
            <Function size={16} />
          </button>
          <button
            onClick={() => formatText('matrix')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Matrix"
          >
            <Target size={16} />
          </button>
        </div>

        {/* Document Structure */}
        <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
          <button
            onClick={() => insertStructure('section')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Section"
          >
            <Hash size={16} />
          </button>
          <button
            onClick={() => insertStructure('itemize')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => insertStructure('table')}
            className="liquid-glass-button p-2 rounded-ios hover:bg-blue-500/20"
            title="Table"
          >
            <span className="text-sm">⊞</span>
          </button>
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => e.target.value && onInsert(`${e.target.value}{text}`)}
            className={`liquid-glass-button px-3 py-2 rounded-ios text-sm ${
              darkMode ? 'bg-white/10 text-white' : 'bg-white/30 text-gray-900'
            }`}
            defaultValue=""
          >
            <option value="">Size</option>
            {fontSizes.map((size) => (
              <option key={size.command} value={size.command}>
                {size.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => e.target.value && onInsert(`\\textcolor{${e.target.value}}{text}`)}
            className={`liquid-glass-button px-3 py-2 rounded-ios text-sm ${
              darkMode ? 'bg-white/10 text-white' : 'bg-white/30 text-gray-900'
            }`}
            defaultValue=""
          >
            <option value="">Color</option>
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mathematical Symbols Panel */}
      {showMathPanel && (
        <div className={`math-panel mt-4 p-4 rounded-ios ${
          darkMode ? 'bg-black/20' : 'bg-white/20'
        } border border-white/30`}>
          {/* Category Tabs */}
          <div className="flex space-x-2 mb-4 border-b border-white/20 pb-2">
            {Object.keys(mathSymbols).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-ios text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-blue-500/30 text-blue-600'
                    : 'hover:bg-white/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Symbol Grid */}
          <div className="grid grid-cols-8 gap-2">
            {mathSymbols[activeCategory]?.map((symbol, index) => (
              <button
                key={index}
                onClick={() => onInsert(symbol.latex)}
                className={`symbol-button p-2 rounded-ios text-center hover:bg-blue-500/20 transition-all ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-white/30'
                }`}
                title={symbol.latex}
              >
                <span className="text-lg">{symbol.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormattingToolbar;