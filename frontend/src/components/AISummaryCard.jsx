import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AISummaryCard = ({ summary, loading, onGenerate, onClose }) => {
  return (
    <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#b44d3b]">AI Business Summary</h3>

        <div className="flex items-center gap-3">
          {summary && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg shadow-sm"
            >
              Close
            </button>
          )}

          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm"
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-[#4a2d2a]">
        {summary ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summary}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-500">Click Generate to create summary</p>
        )}
      </div>
    </div>
  );
};

export default AISummaryCard;
