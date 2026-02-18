import React, { useState } from 'react';
import { contentApi } from '../services/api';
import { Bot, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function NewRequest() {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await contentApi.generate(context);
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary-400">
          <Bot className="w-8 h-8" />
          Multi-Agent Generation
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              User Context / Intent
            </label>
            <textarea
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Help me reach out to tech startups in London about our new AI tool..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !context}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Generate Content
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Generation Complete
            </div>
            
            <div className="bg-slate-900 rounded-lg border border-slate-700 divide-y divide-slate-800">
              <div className="p-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Headline</span>
                <p className="mt-1 text-lg font-semibold text-slate-100">{result.headline}</p>
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Body</span>
                <p className="mt-1 text-slate-300 whitespace-pre-wrap">{result.body}</p>
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CTA</span>
                <p className="mt-1 text-primary-400 font-medium">{result.cta}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
