import katex from 'katex';
import 'katex/dist/katex.min.css';

// Advanced LaTeX processing and rendering utilities
export class LatexRenderer {
  private static mathDelimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\begin{equation}', right: '\\end{equation}', display: true },
    { left: '\\begin{align}', right: '\\end{align}', display: true },
    { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
    { left: '\\begin{gather}', right: '\\end{gather}', display: true },
    { left: '\\begin{multline}', right: '\\end{multline}', display: true },
  ];

  // Comprehensive LaTeX command mappings
  private static latexCommands: { [key: string]: (content: string) => string } = {
    // Document structure
    '\\documentclass': (content: string) => `<div class="document-class" data-class="${content}">`,
    '\\title': (content: string) => `<h1 class="document-title text-4xl font-bold text-center mb-6">${content}</h1>`,
    '\\author': (content: string) => `<div class="document-author text-lg text-center mb-4 text-gray-600">${content}</div>`,
    '\\date': (content: string) => `<div class="document-date text-center mb-8 text-gray-500">${content}</div>`,
    '\\maketitle': () => '',
    
    // Sections
    '\\part': (content: string) => `<h1 class="part-title text-5xl font-bold mb-8 mt-12 text-center border-b-2 pb-4">${content}</h1>`,
    '\\chapter': (content: string) => `<h2 class="chapter-title text-4xl font-bold mb-6 mt-10">${content}</h2>`,
    '\\section': (content: string) => `<h3 class="section-title text-3xl font-bold mb-4 mt-8">${content}</h3>`,
    '\\subsection': (content: string) => `<h4 class="subsection-title text-2xl font-bold mb-3 mt-6">${content}</h4>`,
    '\\subsubsection': (content: string) => `<h5 class="subsubsection-title text-xl font-bold mb-2 mt-4">${content}</h5>`,
    '\\paragraph': (content: string) => `<h6 class="paragraph-title text-lg font-bold mt-3 mb-1">${content}</h6>`,
    
    // Text formatting
    '\\textbf': (content: string) => `<strong class="font-bold">${content}</strong>`,
    '\\textit': (content: string) => `<em class="italic">${content}</em>`,
    '\\texttt': (content: string) => `<code class="font-mono bg-gray-100 px-1 rounded">${content}</code>`,
    '\\textsc': (content: string) => `<span class="text-sm uppercase tracking-wide">${content}</span>`,
    '\\underline': (content: string) => `<span class="underline">${content}</span>`,
    '\\emph': (content: string) => `<em class="italic">${content}</em>`,
    
    // Font sizes
    '\\tiny': (content: string) => `<span class="text-xs">${content}</span>`,
    '\\scriptsize': (content: string) => `<span class="text-xs">${content}</span>`,
    '\\footnotesize': (content: string) => `<span class="text-sm">${content}</span>`,
    '\\small': (content: string) => `<span class="text-sm">${content}</span>`,
    '\\normalsize': (content: string) => `<span class="text-base">${content}</span>`,
    '\\large': (content: string) => `<span class="text-lg">${content}</span>`,
    '\\Large': (content: string) => `<span class="text-xl">${content}</span>`,
    '\\LARGE': (content: string) => `<span class="text-2xl">${content}</span>`,
    '\\huge': (content: string) => `<span class="text-3xl">${content}</span>`,
    '\\Huge': (content: string) => `<span class="text-4xl">${content}</span>`,
    
    // Colors
    '\\textcolor': (content: string) => {
      const match = content.match(/^{([^}]+)}{(.+)}$/);
      if (match) {
        const [, color, text] = match;
        const colorClass = this.getColorClass(color);
        return `<span class="${colorClass}">${text}</span>`;
      }
      return content;
    },
  };

  // Color mappings
  private static getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'red': 'text-red-600',
      'blue': 'text-blue-600',
      'green': 'text-green-600',
      'yellow': 'text-yellow-600',
      'purple': 'text-purple-600',
      'orange': 'text-orange-600',
      'pink': 'text-pink-600',
      'gray': 'text-gray-600',
      'black': 'text-black',
      'white': 'text-white',
    };
    return colorMap[color] || 'text-gray-900';
  }

  // Main rendering function
  public static renderLatex(content: string): string {
    try {
      let processed = content;

      // First, extract and render mathematical expressions
      processed = this.renderMathExpressions(processed);

      // Handle environments
      processed = this.processEnvironments(processed);

      // Process LaTeX commands
      processed = this.processLatexCommands(processed);

      // Handle basic formatting
      processed = this.processBasicFormatting(processed);

      // Clean up
      processed = this.cleanup(processed);

      return processed;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return `<div class="error-message text-red-600 p-4 border border-red-300 rounded bg-red-50">
        <strong>LaTeX Rendering Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}
      </div>`;
    }
  }

  // Render mathematical expressions using KaTeX
  private static renderMathExpressions(content: string): string {
    let processed = content;

    // Process display math first ($$...$$)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { 
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
          macros: this.getKaTeXMacros()
        });
        return `<div class="math-display my-4">${rendered}</div>`;
      } catch (error) {
        return `<div class="math-error text-red-600">Math Error: ${match}</div>`;
      }
    });

    // Process inline math ($...$)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { 
          displayMode: false,
          throwOnError: false,
          errorColor: '#cc0000',
          macros: this.getKaTeXMacros()
        });
        return `<span class="math-inline">${rendered}</span>`;
      } catch (error) {
        return `<span class="math-error text-red-600">Math Error: ${match}</span>`;
      }
    });

    // Process equation environments
    processed = processed.replace(/\\begin\{(equation|align|alignat|gather|multline)\}([\s\S]*?)\\end\{\1\}/g, (match, env, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { 
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
          macros: this.getKaTeXMacros()
        });
        return `<div class="math-environment math-${env} my-6">${rendered}</div>`;
      } catch (error) {
        return `<div class="math-error text-red-600">Math Environment Error: ${match}</div>`;
      }
    });

    return processed;
  }

  // KaTeX macros for advanced mathematical notation
  private static getKaTeXMacros() {
    return {
      "\\RR": "\\mathbb{R}",
      "\\CC": "\\mathbb{C}",
      "\\ZZ": "\\mathbb{Z}",
      "\\NN": "\\mathbb{N}",
      "\\QQ": "\\mathbb{Q}",
      "\\FF": "\\mathbb{F}",
      "\\PP": "\\mathbb{P}",
      "\\EE": "\\mathbb{E}",
      "\\Var": "\\mathrm{Var}",
      "\\Cov": "\\mathrm{Cov}",
      "\\tr": "\\mathrm{tr}",
      "\\rank": "\\mathrm{rank}",
      "\\det": "\\mathrm{det}",
      "\\dim": "\\mathrm{dim}",
      "\\ker": "\\mathrm{ker}",
      "\\im": "\\mathrm{im}",
      "\\span": "\\mathrm{span}",
      "\\supp": "\\mathrm{supp}",
      "\\argmin": "\\mathrm{argmin}",
      "\\argmax": "\\mathrm{argmax}",
    };
  }

  // Process LaTeX environments
  private static processEnvironments(content: string): string {
    let processed = content;

    // Abstract environment
    processed = processed.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, 
      '<div class="abstract bg-gray-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500"><h4 class="font-bold mb-3 text-lg">Abstract</h4>$1</div>');

    // Itemize environment
    processed = processed.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, items) => {
      const processedItems = items.replace(/\\item\s+/g, '<li class="mb-2">').replace(/\n\s*(?=<li)/g, '</li>\n');
      return `<ul class="list-disc pl-6 mb-4 space-y-1">${processedItems}</li></ul>`;
    });

    // Enumerate environment
    processed = processed.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, items) => {
      const processedItems = items.replace(/\\item\s+/g, '<li class="mb-2">').replace(/\n\s*(?=<li)/g, '</li>\n');
      return `<ol class="list-decimal pl-6 mb-4 space-y-1">${processedItems}</li></ol>`;
    });

    // Description environment
    processed = processed.replace(/\\begin\{description\}([\s\S]*?)\\end\{description\}/g, (match, items) => {
      const processedItems = items.replace(/\\item\[([^\]]+)\]\s*/g, '<dt class="font-bold mt-2">$1</dt><dd class="ml-4 mb-2">').replace(/\n\s*(?=<dt)/g, '</dd>\n');
      return `<dl class="mb-4">${processedItems}</dd></dl>`;
    });

    // Quote environment
    processed = processed.replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, 
      '<blockquote class="border-l-4 border-gray-400 pl-4 italic mb-4 text-gray-700">$1</blockquote>');

    // Center environment
    processed = processed.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, 
      '<div class="text-center mb-4">$1</div>');

    // Verbatim environment
    processed = processed.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, 
      '<pre class="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm">$1</pre>');

    // Code environment (listings)
    processed = processed.replace(/\\begin\{lstlisting\}([\s\S]*?)\\end\{lstlisting\}/g, 
      '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm">$1</pre>');

    return processed;
  }

  // Process LaTeX commands
  private static processLatexCommands(content: string): string {
    let processed = content;

    // Process commands with arguments
    for (const [command, handler] of Object.entries(this.latexCommands)) {
      const regex = new RegExp(`\\${command.replace(/\\/g, '\\\\')}\\{([^}]+)\\}`, 'g');
      processed = processed.replace(regex, (match, arg) => handler(arg));
    }

    // Special handling for commands with multiple arguments
    processed = processed.replace(/\\textcolor\{([^}]+)\}\{([^}]+)\}/g, (match, color, text) => {
      const colorClass = this.getColorClass(color);
      return `<span class="${colorClass}">${text}</span>`;
    });

    return processed;
  }

  // Process basic formatting
  private static processBasicFormatting(content: string): string {
    let processed = content;

    // Handle paragraph breaks
    processed = processed.replace(/\n\s*\n/g, '</p><p class="mb-4">');
    processed = `<p class="mb-4">${processed}</p>`;

    // Handle line breaks
    processed = processed.replace(/\\\\(\[.*?\])?/g, '<br class="mb-2">');

    // Handle special characters
    processed = processed.replace(/\\&/g, '&amp;');
    processed = processed.replace(/\\_/g, '_');
    processed = processed.replace(/\\#/g, '#');
    processed = processed.replace(/\\\$/g, '$');
    processed = processed.replace(/\\%/g, '%');

    // Handle spacing commands
    processed = processed.replace(/\\,/g, '<span class="mx-1"></span>');
    processed = processed.replace(/\\;/g, '<span class="mx-2"></span>');
    processed = processed.replace(/\\quad/g, '<span class="mx-4"></span>');
    processed = processed.replace(/\\qquad/g, '<span class="mx-8"></span>');

    return processed;
  }

  // Cleanup processed content
  private static cleanup(content: string): string {
    let processed = content;

    // Remove empty paragraphs
    processed = processed.replace(/<p class="mb-4">\s*<\/p>/g, '');

    // Clean up document class markers
    processed = processed.replace(/<div class="document-class"[^>]*>/g, '');

    // Remove LaTeX document structure commands that don't need rendering
    processed = processed.replace(/\\begin\{document\}/g, '');
    processed = processed.replace(/\\end\{document\}/g, '');
    processed = processed.replace(/\\usepackage\{[^}]*\}/g, '');

    return processed;
  }

  // Extract math content for separate processing
  public static extractMathContent(content: string): { text: string; math: Array<{ type: 'inline' | 'display'; content: string; index: number }> } {
    const mathExpressions: Array<{ type: 'inline' | 'display'; content: string; index: number }> = [];
    let text = content;
    let index = 0;

    // Extract display math
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      mathExpressions.push({ type: 'display', content: math.trim(), index: index++ });
      return `__MATH_PLACEHOLDER_${index - 1}__`;
    });

    // Extract inline math
    text = text.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      mathExpressions.push({ type: 'inline', content: math.trim(), index: index++ });
      return `__MATH_PLACEHOLDER_${index - 1}__`;
    });

    return { text, math: mathExpressions };
  }

  // Validate LaTeX syntax
  public static validateLatex(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for unmatched braces
    const braceCount = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
    if (braceCount !== 0) {
      errors.push(`Unmatched braces: ${braceCount > 0 ? 'missing closing' : 'missing opening'} brace(s)`);
    }

    // Check for unmatched math delimiters
    const dollarCount = (content.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      errors.push('Unmatched math delimiters: odd number of $ symbols');
    }

    // Check for basic environment matching
    const beginMatches = content.match(/\\begin\{([^}]+)\}/g) || [];
    const endMatches = content.match(/\\end\{([^}]+)\}/g) || [];
    
    if (beginMatches.length !== endMatches.length) {
      errors.push('Unmatched environments: different number of \\begin and \\end commands');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}